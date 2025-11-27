import { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Loader2, Search } from "lucide-react";

// Example product data (replace with API call in production)
const PRODUCTS = [
  { id: 1, name: "College Backpack", category: "Bags", price: 45 },
  { id: 2, name: "Campus T-Shirt", category: "Clothing", price: 20 },
  { id: 3, name: "Scientific Calculator", category: "Electronics", price: 35 },
  { id: 4, name: "Notebook A4", category: "Stationery", price: 5 },
  { id: 5, name: "Ballpoint Pen Set", category: "Stationery", price: 3 },
  { id: 6, name: "USB Flash Drive 32GB", category: "Electronics", price: 12 },
  { id: 7, name: "Campus Hoodie", category: "Clothing", price: 35 },
  { id: 8, name: "Water Bottle", category: "Accessories", price: 18 },
  { id: 9, name: "Textbook Highlighters", category: "Stationery", price: 8 },
  { id: 10, name: "Laptop Sleeve", category: "Bags", price: 22 },
];

/**
 * SearchBox Component
 * A reusable search component with dropdown suggestions and keyboard navigation
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Callback function when search is executed
 * @param {Array} props.products - Optional custom product list (defaults to PRODUCTS)
 * @param {number} props.maxSuggestions - Maximum number of suggestions to show (default: 6)
 * @param {string} props.placeholder - Input placeholder text
 */
const SearchBox = ({ 
  onSearch, 
  products = PRODUCTS, 
  maxSuggestions = 6,
  placeholder = "Search for products..."
}) => {
  // State management
  const [query, setQuery] = useState(""); // Current search input
  const [focused, setFocused] = useState(false); // Whether input is focused
  const [suggestions, setSuggestions] = useState([]); // Filtered suggestions
  const [showDropdown, setShowDropdown] = useState(false); // Dropdown visibility
  const [selectedIndex, setSelectedIndex] = useState(-1); // Currently selected suggestion index (-1 = none)
  const [isSearching, setIsSearching] = useState(false); // Loading state for async operations
  
  // Refs for DOM access
  const containerRef = useRef(null); // Container ref for outside click detection
  const inputRef = useRef(null); // Input ref for focus management
  const suggestionRefs = useRef([]); // Array of suggestion element refs for scrolling

  /**
   * Filter products based on search query
   * Uses useCallback to memoize the function and prevent unnecessary re-renders
   * 
   * Performance optimization: Only filters when query or products change
   * Error handling: Safely handles null/undefined values
   */
  const filterSuggestions = useCallback((searchQuery) => {
    // Edge case: Empty or whitespace-only query
    if (!searchQuery || !searchQuery.trim()) {
      return [];
    }

    try {
      const q = searchQuery.trim().toLowerCase();
      
      // Edge case: Ensure products is an array
      if (!Array.isArray(products)) {
        console.error("SearchBox: products prop must be an array");
        return [];
      }

      // Filter and limit results
      const filtered = products.filter((product) => {
        // Error handling: Ensure product has required properties
        if (!product || typeof product !== 'object') {
          console.warn("SearchBox: Invalid product object", product);
          return false;
        }

        const name = String(product.name || "").toLowerCase();
        const category = String(product.category || "").toLowerCase();
        
        return name.includes(q) || category.includes(q);
      }).slice(0, maxSuggestions);

      return filtered;
    } catch (error) {
      // Error handling: Catch any unexpected errors during filtering
      console.error("SearchBox: Error filtering suggestions", error);
      return [];
    }
  }, [products, maxSuggestions]);

  /**
   * Update suggestions when query changes
   * Performance optimization: Debouncing could be added here for API calls
   */
  useEffect(() => {
    if (query.trim()) {
      const filtered = filterSuggestions(query);
      setSuggestions(filtered);
      setShowDropdown(true);
      setSelectedIndex(-1); // Reset selection when suggestions change
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  }, [query, filterSuggestions]);

  /**
   * Handle clicks outside the search box to close dropdown
   * Performance optimization: Clean up event listener on unmount
   */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
        setFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Execute search with current query or selected suggestion
   * Error handling: Validates input before calling onSearch
   * 
   * @param {string} searchQuery - Optional query to search (defaults to current query)
   */
  const executeSearch = useCallback(async (searchQuery) => {
    const queryToSearch = searchQuery || query;
    
    // Edge case: Prevent search with empty query
    if (!queryToSearch || !queryToSearch.trim()) {
      console.warn("SearchBox: Cannot search with empty query");
      return;
    }

    try {
      setIsSearching(true);
      setShowDropdown(false);
      setFocused(false);
      setSelectedIndex(-1);

      // Call parent component's search handler
      if (onSearch && typeof onSearch === 'function') {
        await onSearch(queryToSearch.trim());
      } else {
        console.warn("SearchBox: onSearch prop is not a function");
      }
    } catch (error) {
      // Error handling: Log search execution errors
      console.error("SearchBox: Error executing search", error);
    } finally {
      setIsSearching(false);
    }
  }, [query, onSearch]);

  /**
   * Handle keyboard navigation in dropdown
   * Supports: Arrow Up, Arrow Down, Enter, Escape
   * 
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = useCallback((e) => {
    // Only handle keyboard navigation when dropdown is visible
    if (!showDropdown || suggestions.length === 0) {
      // Allow Enter to search even when dropdown is closed
      if (e.key === "Enter") {
        e.preventDefault();
        executeSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        // Move selection down, wrap to top if at end
        setSelectedIndex((prevIndex) => 
          prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        // Move selection up, wrap to bottom if at start
        setSelectedIndex((prevIndex) => 
          prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          // Search for selected suggestion
          const selectedProduct = suggestions[selectedIndex];
          setQuery(selectedProduct.name);
          executeSearch(selectedProduct.name);
        } else {
          // Search for current input
          executeSearch();
        }
        break;

      case "Escape":
        e.preventDefault();
        // Close dropdown and clear selection
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;

      default:
        break;
    }
  }, [showDropdown, suggestions, selectedIndex, executeSearch]);

  /**
   * Scroll selected suggestion into view
   * Performance optimization: Only scroll when selection changes
   */
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  /**
   * Handle suggestion click
   * 
   * @param {Object} product - Selected product
   * @param {number} index - Index of selected product
   */
  const handleSuggestionClick = useCallback((product, index) => {
    // Error handling: Validate product object
    if (!product || !product.name) {
      console.warn("SearchBox: Invalid product selected", product);
      return;
    }

    setQuery(product.name);
    setSelectedIndex(index);
    executeSearch(product.name);
  }, [executeSearch]);

  /**
   * Handle input change
   * 
   * @param {Event} e - Input change event
   */
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Reset selected index when user types
    setSelectedIndex(-1);
  }, []);

  /**
   * Handle input focus
   */
  const handleFocus = useCallback(() => {
    setFocused(true);
    // Show dropdown if there's already a query
    if (query.trim()) {
      setShowDropdown(true);
    }
  }, [query]);

  /**
   * Handle input blur
   * Note: We use onMouseDown for suggestions instead of onClick
   * to execute before blur event
   */
  const handleBlur = useCallback(() => {
    setFocused(false);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-white/80 px-3 py-2 shadow-sm shadow-blue-50 transition ${
          focused ? 'border-blue-200 ring-2 ring-blue-200' : 'border-blue-100'
        } ${isSearching ? 'opacity-80' : ''}`}
      >
        <Search className="h-4 w-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          className="w-full border-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={isSearching}
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls="searchbox-suggestions"
          aria-expanded={showDropdown}
          aria-activedescendant={
            selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
          }
        />
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-sm shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-md disabled:opacity-60"
          onClick={() => executeSearch()}
          disabled={isSearching || !query.trim()}
          aria-label="Search"
          tabIndex={-1}
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </button>
      </div>

      {showDropdown && (
        <div
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-blue-50 bg-white/90 shadow-lg shadow-blue-100 backdrop-blur"
          id="searchbox-suggestions"
          role="listbox"
        >
          {suggestions.length > 0 ? (
            suggestions.map((item, index) => (
              <button
                key={item.id || index}
                ref={(el) => (suggestionRefs.current[index] = el)}
                id={`suggestion-${index}`}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition ${
                  selectedIndex === index ? 'bg-blue-50' : 'hover:bg-blue-50/60'
                }`}
                role="option"
                aria-selected={selectedIndex === index}
                tabIndex={0}
                onMouseDown={() => handleSuggestionClick(item, index)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div>
                  <div className="font-semibold text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.category}</div>
                </div>
                <span className="text-sm font-semibold text-blue-600">{item.price}đ</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-600" role="status">
              No products found matching &apos;{query}&apos;
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// PropTypes for type checking and documentation
SearchBox.propTypes = {
  onSearch: PropTypes.func.isRequired,
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      category: PropTypes.string,
      price: PropTypes.number,
    })
  ),
  maxSuggestions: PropTypes.number,
  placeholder: PropTypes.string,
};

export default SearchBox;
