"""
Training data for the Campus Shop Assistant chatbot.

This file contains labeled examples for:
1. Text Classification (intents)
2. Named Entity Recognition (NER)

Format follows spaCy's training data structure.

Supported Intents (5 total):
- search_product: Find products by name/category/price
- greeting: Hello, hi, welcome messages
- ask_price: Price inquiries
- get_recommendations: Request for suggestions
- help: What can you do?

Note: add_to_cart and track_order are handled by the UI (ProductCard buttons)
"""

# All supported intent labels (5 intents)
INTENT_LABELS = [
    "search_product",
    "greeting", 
    "ask_price",
    "get_recommendations",
    "help",
]

def make_cats(active_intent):
    """Helper to create cats dict with one active intent"""
    return {intent: (1.0 if intent == active_intent else 0.0) for intent in INTENT_LABELS}

# =============================================================================
# TEXT CLASSIFICATION TRAINING DATA
# Target: 200+ examples per intent for robust training
# =============================================================================

TEXTCAT_TRAINING_DATA = [
    # =========================================================================
    # search_product intent (~200 examples)
    # =========================================================================
    # Basic search patterns
    ("find laptops", {"cats": make_cats("search_product")}),
    ("show me books", {"cats": make_cats("search_product")}),
    ("I need a backpack", {"cats": make_cats("search_product")}),
    ("looking for electronics", {"cats": make_cats("search_product")}),
    ("do you have calculators", {"cats": make_cats("search_product")}),
    ("search for textbooks", {"cats": make_cats("search_product")}),
    ("find cheap notebooks", {"cats": make_cats("search_product")}),
    ("show me hoodies under 50", {"cats": make_cats("search_product")}),
    ("I want to buy a monitor", {"cats": make_cats("search_product")}),
    ("any keyboards available", {"cats": make_cats("search_product")}),
    ("find me a desk lamp", {"cats": make_cats("search_product")}),
    ("search headphones", {"cats": make_cats("search_product")}),
    ("looking for running shoes", {"cats": make_cats("search_product")}),
    ("show me yoga mats", {"cats": make_cats("search_product")}),
    ("find used textbooks", {"cats": make_cats("search_product")}),
    ("browse electronics", {"cats": make_cats("search_product")}),
    ("show clothing items", {"cats": make_cats("search_product")}),
    ("find stationery", {"cats": make_cats("search_product")}),
    ("show me accessories", {"cats": make_cats("search_product")}),
    ("search for pens", {"cats": make_cats("search_product")}),
    
    # More natural search phrases
    ("I'm looking for a jacket", {"cats": make_cats("search_product")}),
    ("do you sell umbrellas", {"cats": make_cats("search_product")}),
    ("find items under 100", {"cats": make_cats("search_product")}),
    ("show products in electronics", {"cats": make_cats("search_product")}),
    ("looking for MacBook", {"cats": make_cats("search_product")}),
    ("find AirPods", {"cats": make_cats("search_product")}),
    ("search for chargers", {"cats": make_cats("search_product")}),
    ("show me water bottles", {"cats": make_cats("search_product")}),
    ("I need highlighters", {"cats": make_cats("search_product")}),
    ("find tennis racket", {"cats": make_cats("search_product")}),
    
    # Price-constrained searches
    ("laptops under 500", {"cats": make_cats("search_product")}),
    ("books below 30", {"cats": make_cats("search_product")}),
    ("find something under 20", {"cats": make_cats("search_product")}),
    ("show me items less than 50", {"cats": make_cats("search_product")}),
    ("products between 10 and 100", {"cats": make_cats("search_product")}),
    ("cheap electronics", {"cats": make_cats("search_product")}),
    ("affordable textbooks", {"cats": make_cats("search_product")}),
    ("budget headphones", {"cats": make_cats("search_product")}),
    ("expensive laptops", {"cats": make_cats("search_product")}),
    ("premium accessories", {"cats": make_cats("search_product")}),
    
    # Category-based searches
    ("show me all electronics", {"cats": make_cats("search_product")}),
    ("browse books section", {"cats": make_cats("search_product")}),
    ("clothing category", {"cats": make_cats("search_product")}),
    ("stationery items", {"cats": make_cats("search_product")}),
    ("accessories collection", {"cats": make_cats("search_product")}),
    ("all products in books", {"cats": make_cats("search_product")}),
    ("electronics department", {"cats": make_cats("search_product")}),
    ("show clothing section", {"cats": make_cats("search_product")}),
    ("browse stationery", {"cats": make_cats("search_product")}),
    ("accessories category please", {"cats": make_cats("search_product")}),
    
    # Question-style searches
    ("what laptops do you have", {"cats": make_cats("search_product")}),
    ("do you have any books", {"cats": make_cats("search_product")}),
    ("are there any hoodies", {"cats": make_cats("search_product")}),
    ("got any calculators", {"cats": make_cats("search_product")}),
    ("any monitors in stock", {"cats": make_cats("search_product")}),
    ("what electronics are available", {"cats": make_cats("search_product")}),
    ("do you carry textbooks", {"cats": make_cats("search_product")}),
    ("is there a keyboard", {"cats": make_cats("search_product")}),
    ("what kind of bags do you have", {"cats": make_cats("search_product")}),
    ("any pens available", {"cats": make_cats("search_product")}),
    
    # Specific product searches
    ("find Dell laptop", {"cats": make_cats("search_product")}),
    ("show HP monitor", {"cats": make_cats("search_product")}),
    ("looking for Nike shoes", {"cats": make_cats("search_product")}),
    ("search for Apple AirPods", {"cats": make_cats("search_product")}),
    ("find Logitech mouse", {"cats": make_cats("search_product")}),
    ("show me North Face backpack", {"cats": make_cats("search_product")}),
    ("looking for TI-84 calculator", {"cats": make_cats("search_product")}),
    ("find Hydro Flask bottle", {"cats": make_cats("search_product")}),
    ("search for Wilson racket", {"cats": make_cats("search_product")}),
    ("show IKEA lamp", {"cats": make_cats("search_product")}),
    
    # Condition-based searches
    ("find new laptops", {"cats": make_cats("search_product")}),
    ("used textbooks please", {"cats": make_cats("search_product")}),
    ("like new electronics", {"cats": make_cats("search_product")}),
    ("barely used items", {"cats": make_cats("search_product")}),
    ("brand new accessories", {"cats": make_cats("search_product")}),
    ("second hand books", {"cats": make_cats("search_product")}),
    ("refurbished laptop", {"cats": make_cats("search_product")}),
    ("gently used clothing", {"cats": make_cats("search_product")}),
    ("mint condition electronics", {"cats": make_cats("search_product")}),
    ("pre-owned items", {"cats": make_cats("search_product")}),
    
    # Casual/informal searches
    ("got any laptops", {"cats": make_cats("search_product")}),
    ("lemme see some books", {"cats": make_cats("search_product")}),
    ("show me what you got", {"cats": make_cats("search_product")}),
    ("whatcha got in electronics", {"cats": make_cats("search_product")}),
    ("i wanna see headphones", {"cats": make_cats("search_product")}),
    ("need a calculator asap", {"cats": make_cats("search_product")}),
    ("hook me up with a charger", {"cats": make_cats("search_product")}),
    ("looking for something to read", {"cats": make_cats("search_product")}),
    ("need stuff for class", {"cats": make_cats("search_product")}),
    ("what can i buy here", {"cats": make_cats("search_product")}),
    
    # Long-form searches
    ("I'm looking for a laptop for coding and schoolwork", {"cats": make_cats("search_product")}),
    ("can you show me some books for my biology class", {"cats": make_cats("search_product")}),
    ("I need to find a good backpack for carrying my laptop", {"cats": make_cats("search_product")}),
    ("looking for electronics that are good for students", {"cats": make_cats("search_product")}),
    ("do you have any affordable options for calculators", {"cats": make_cats("search_product")}),
    ("I want to browse through your clothing collection", {"cats": make_cats("search_product")}),
    ("show me what stationery items you have available", {"cats": make_cats("search_product")}),
    ("can I see the accessories you have in stock", {"cats": make_cats("search_product")}),
    ("looking for something under 50 dollars", {"cats": make_cats("search_product")}),
    ("find me the best deals on electronics", {"cats": make_cats("search_product")}),
    
    # More variations
    ("search laptops", {"cats": make_cats("search_product")}),
    ("find books", {"cats": make_cats("search_product")}),
    ("show hoodies", {"cats": make_cats("search_product")}),
    ("get me a keyboard", {"cats": make_cats("search_product")}),
    ("display monitors", {"cats": make_cats("search_product")}),
    ("list all backpacks", {"cats": make_cats("search_product")}),
    ("give me laptops", {"cats": make_cats("search_product")}),
    ("pull up electronics", {"cats": make_cats("search_product")}),
    ("let me see books", {"cats": make_cats("search_product")}),
    ("bring up clothing", {"cats": make_cats("search_product")}),
    
    # Even more search patterns
    ("i want laptops", {"cats": make_cats("search_product")}),
    ("i need books", {"cats": make_cats("search_product")}),
    ("where are the electronics", {"cats": make_cats("search_product")}),
    ("take me to clothing", {"cats": make_cats("search_product")}),
    ("show the accessories", {"cats": make_cats("search_product")}),
    ("view stationery", {"cats": make_cats("search_product")}),
    ("open electronics section", {"cats": make_cats("search_product")}),
    ("go to books", {"cats": make_cats("search_product")}),
    ("see clothing items", {"cats": make_cats("search_product")}),
    ("check out laptops", {"cats": make_cats("search_product")}),
    
    # Campus-specific searches
    ("textbooks for CS101", {"cats": make_cats("search_product")}),
    ("books for calculus class", {"cats": make_cats("search_product")}),
    ("engineering supplies", {"cats": make_cats("search_product")}),
    ("dorm room essentials", {"cats": make_cats("search_product")}),
    ("college supplies", {"cats": make_cats("search_product")}),
    ("school supplies", {"cats": make_cats("search_product")}),
    ("study materials", {"cats": make_cats("search_product")}),
    ("lab equipment", {"cats": make_cats("search_product")}),
    ("university hoodie", {"cats": make_cats("search_product")}),
    ("campus merch", {"cats": make_cats("search_product")}),
    
    # Additional search phrases
    ("search for something", {"cats": make_cats("search_product")}),
    ("find an item", {"cats": make_cats("search_product")}),
    ("looking for products", {"cats": make_cats("search_product")}),
    ("browse items", {"cats": make_cats("search_product")}),
    ("show available products", {"cats": make_cats("search_product")}),
    ("display inventory", {"cats": make_cats("search_product")}),
    ("what's in stock", {"cats": make_cats("search_product")}),
    ("available items", {"cats": make_cats("search_product")}),
    ("product catalog", {"cats": make_cats("search_product")}),
    ("shop for items", {"cats": make_cats("search_product")}),
    
    # Price with keywords
    ("cheap laptops please", {"cats": make_cats("search_product")}),
    ("affordable books", {"cats": make_cats("search_product")}),
    ("budget friendly electronics", {"cats": make_cats("search_product")}),
    ("inexpensive accessories", {"cats": make_cats("search_product")}),
    ("low cost stationery", {"cats": make_cats("search_product")}),
    ("discounted items", {"cats": make_cats("search_product")}),
    ("sale items", {"cats": make_cats("search_product")}),
    ("best value products", {"cats": make_cats("search_product")}),
    ("deals on electronics", {"cats": make_cats("search_product")}),
    ("bargain books", {"cats": make_cats("search_product")}),
    
    # More question forms
    ("can you find me a laptop", {"cats": make_cats("search_product")}),
    ("could you show me books", {"cats": make_cats("search_product")}),
    ("would you search for headphones", {"cats": make_cats("search_product")}),
    ("can I see the monitors", {"cats": make_cats("search_product")}),
    ("may I browse electronics", {"cats": make_cats("search_product")}),
    ("please find me a calculator", {"cats": make_cats("search_product")}),
    ("help me find a backpack", {"cats": make_cats("search_product")}),
    ("assist me in finding books", {"cats": make_cats("search_product")}),
    ("I'd like to see laptops", {"cats": make_cats("search_product")}),
    ("I'd love to browse clothing", {"cats": make_cats("search_product")}),
    
    # Intent with context
    ("my laptop broke, find me a new one", {"cats": make_cats("search_product")}),
    ("I lost my calculator, need another", {"cats": make_cats("search_product")}),
    ("starting a new class, need textbooks", {"cats": make_cats("search_product")}),
    ("getting cold, show me hoodies", {"cats": make_cats("search_product")}),
    ("out of pens, find me some", {"cats": make_cats("search_product")}),
    ("need a gift, show me options", {"cats": make_cats("search_product")}),
    ("preparing for finals, need books", {"cats": make_cats("search_product")}),
    ("moving to dorm, need accessories", {"cats": make_cats("search_product")}),
    ("project due, need supplies", {"cats": make_cats("search_product")}),
    ("gym class starting, need shoes", {"cats": make_cats("search_product")}),
    
    # =========================================================================
    # greeting intent (~50 examples)
    # =========================================================================
    ("hello", {"cats": make_cats("greeting")}),
    ("hi there", {"cats": make_cats("greeting")}),
    ("hey", {"cats": make_cats("greeting")}),
    ("good morning", {"cats": make_cats("greeting")}),
    ("good afternoon", {"cats": make_cats("greeting")}),
    ("good evening", {"cats": make_cats("greeting")}),
    ("what's up", {"cats": make_cats("greeting")}),
    ("howdy", {"cats": make_cats("greeting")}),
    ("hi", {"cats": make_cats("greeting")}),
    ("hello there", {"cats": make_cats("greeting")}),
    ("hey there", {"cats": make_cats("greeting")}),
    ("greetings", {"cats": make_cats("greeting")}),
    ("yo", {"cats": make_cats("greeting")}),
    ("hi bot", {"cats": make_cats("greeting")}),
    ("hello chatbot", {"cats": make_cats("greeting")}),
    ("hiya", {"cats": make_cats("greeting")}),
    ("sup", {"cats": make_cats("greeting")}),
    ("heya", {"cats": make_cats("greeting")}),
    ("hello hello", {"cats": make_cats("greeting")}),
    ("hi hi", {"cats": make_cats("greeting")}),
    ("good day", {"cats": make_cats("greeting")}),
    ("morning", {"cats": make_cats("greeting")}),
    ("afternoon", {"cats": make_cats("greeting")}),
    ("evening", {"cats": make_cats("greeting")}),
    ("hey buddy", {"cats": make_cats("greeting")}),
    ("hello friend", {"cats": make_cats("greeting")}),
    ("hi assistant", {"cats": make_cats("greeting")}),
    ("hey assistant", {"cats": make_cats("greeting")}),
    ("hello campus helper", {"cats": make_cats("greeting")}),
    ("hi campus helper", {"cats": make_cats("greeting")}),
    ("what's going on", {"cats": make_cats("greeting")}),
    ("how's it going", {"cats": make_cats("greeting")}),
    ("how are you", {"cats": make_cats("greeting")}),
    ("how are you doing", {"cats": make_cats("greeting")}),
    ("nice to meet you", {"cats": make_cats("greeting")}),
    ("hey hey", {"cats": make_cats("greeting")}),
    ("aloha", {"cats": make_cats("greeting")}),
    ("bonjour", {"cats": make_cats("greeting")}),
    ("hola", {"cats": make_cats("greeting")}),
    ("hi there bot", {"cats": make_cats("greeting")}),
    ("hello shop assistant", {"cats": make_cats("greeting")}),
    ("hey shop bot", {"cats": make_cats("greeting")}),
    ("greetings bot", {"cats": make_cats("greeting")}),
    ("hello there chatbot", {"cats": make_cats("greeting")}),
    ("hi there assistant", {"cats": make_cats("greeting")}),
    ("hey there bot", {"cats": make_cats("greeting")}),
    ("hello again", {"cats": make_cats("greeting")}),
    ("hi again", {"cats": make_cats("greeting")}),
    ("back again", {"cats": make_cats("greeting")}),
    ("I'm back", {"cats": make_cats("greeting")}),
    
    # =========================================================================
    # ask_price intent (~50 examples)
    # =========================================================================
    ("how much is this", {"cats": make_cats("ask_price")}),
    ("what's the price", {"cats": make_cats("ask_price")}),
    ("how much does it cost", {"cats": make_cats("ask_price")}),
    ("price of the laptop", {"cats": make_cats("ask_price")}),
    ("what does this cost", {"cats": make_cats("ask_price")}),
    ("how much for the book", {"cats": make_cats("ask_price")}),
    ("tell me the price", {"cats": make_cats("ask_price")}),
    ("what's the cost", {"cats": make_cats("ask_price")}),
    ("price check", {"cats": make_cats("ask_price")}),
    ("how much is the calculator", {"cats": make_cats("ask_price")}),
    ("cost of headphones", {"cats": make_cats("ask_price")}),
    ("how much are the shoes", {"cats": make_cats("ask_price")}),
    ("what's the price of this item", {"cats": make_cats("ask_price")}),
    ("how much does the hoodie cost", {"cats": make_cats("ask_price")}),
    ("price of monitor", {"cats": make_cats("ask_price")}),
    ("what's the cost of the backpack", {"cats": make_cats("ask_price")}),
    ("how much for this", {"cats": make_cats("ask_price")}),
    ("price please", {"cats": make_cats("ask_price")}),
    ("tell me how much", {"cats": make_cats("ask_price")}),
    ("what price", {"cats": make_cats("ask_price")}),
    ("how much money", {"cats": make_cats("ask_price")}),
    ("cost please", {"cats": make_cats("ask_price")}),
    ("what's it cost", {"cats": make_cats("ask_price")}),
    ("how much does this cost", {"cats": make_cats("ask_price")}),
    ("price of this item", {"cats": make_cats("ask_price")}),
    ("what's the price tag", {"cats": make_cats("ask_price")}),
    ("how much is it", {"cats": make_cats("ask_price")}),
    ("what do you charge", {"cats": make_cats("ask_price")}),
    ("how much are you asking", {"cats": make_cats("ask_price")}),
    ("what's the asking price", {"cats": make_cats("ask_price")}),
    ("price for the keyboard", {"cats": make_cats("ask_price")}),
    ("how much is the mouse", {"cats": make_cats("ask_price")}),
    ("cost of the lamp", {"cats": make_cats("ask_price")}),
    ("price of the bottle", {"cats": make_cats("ask_price")}),
    ("how much for pens", {"cats": make_cats("ask_price")}),
    ("what's the price of textbooks", {"cats": make_cats("ask_price")}),
    ("how much are notebooks", {"cats": make_cats("ask_price")}),
    ("cost of highlighters", {"cats": make_cats("ask_price")}),
    ("price of the umbrella", {"cats": make_cats("ask_price")}),
    ("how much is the racket", {"cats": make_cats("ask_price")}),
    ("what's the cost of AirPods", {"cats": make_cats("ask_price")}),
    ("how much for the charger", {"cats": make_cats("ask_price")}),
    ("price on that", {"cats": make_cats("ask_price")}),
    ("what's the damage", {"cats": make_cats("ask_price")}),
    ("how much am I looking at", {"cats": make_cats("ask_price")}),
    ("what's it gonna cost me", {"cats": make_cats("ask_price")}),
    ("give me the price", {"cats": make_cats("ask_price")}),
    ("I need to know the price", {"cats": make_cats("ask_price")}),
    ("can you tell me the cost", {"cats": make_cats("ask_price")}),
    ("what would this cost", {"cats": make_cats("ask_price")}),
    
    # =========================================================================
    # get_recommendations intent (~50 examples)
    # =========================================================================
    ("what do you recommend", {"cats": make_cats("get_recommendations")}),
    ("suggest something", {"cats": make_cats("get_recommendations")}),
    ("what's popular", {"cats": make_cats("get_recommendations")}),
    ("trending items", {"cats": make_cats("get_recommendations")}),
    ("best sellers", {"cats": make_cats("get_recommendations")}),
    ("what should I buy", {"cats": make_cats("get_recommendations")}),
    ("any recommendations", {"cats": make_cats("get_recommendations")}),
    ("recommend something for me", {"cats": make_cats("get_recommendations")}),
    ("what's trending", {"cats": make_cats("get_recommendations")}),
    ("top rated items", {"cats": make_cats("get_recommendations")}),
    ("popular products", {"cats": make_cats("get_recommendations")}),
    ("suggest a gift", {"cats": make_cats("get_recommendations")}),
    ("what's hot", {"cats": make_cats("get_recommendations")}),
    ("featured items", {"cats": make_cats("get_recommendations")}),
    ("what are people buying", {"cats": make_cats("get_recommendations")}),
    ("give me suggestions", {"cats": make_cats("get_recommendations")}),
    ("recommend something", {"cats": make_cats("get_recommendations")}),
    ("what's good here", {"cats": make_cats("get_recommendations")}),
    ("popular choices", {"cats": make_cats("get_recommendations")}),
    ("top picks", {"cats": make_cats("get_recommendations")}),
    ("best options", {"cats": make_cats("get_recommendations")}),
    ("what's worth buying", {"cats": make_cats("get_recommendations")}),
    ("highly rated items", {"cats": make_cats("get_recommendations")}),
    ("customer favorites", {"cats": make_cats("get_recommendations")}),
    ("most popular items", {"cats": make_cats("get_recommendations")}),
    ("what's selling well", {"cats": make_cats("get_recommendations")}),
    ("hot items", {"cats": make_cats("get_recommendations")}),
    ("editor's choice", {"cats": make_cats("get_recommendations")}),
    ("staff picks", {"cats": make_cats("get_recommendations")}),
    ("curated selection", {"cats": make_cats("get_recommendations")}),
    ("show me your best", {"cats": make_cats("get_recommendations")}),
    ("what do students like", {"cats": make_cats("get_recommendations")}),
    ("popular with students", {"cats": make_cats("get_recommendations")}),
    ("student favorites", {"cats": make_cats("get_recommendations")}),
    ("campus favorites", {"cats": make_cats("get_recommendations")}),
    ("recommend for a student", {"cats": make_cats("get_recommendations")}),
    ("suggest for college", {"cats": make_cats("get_recommendations")}),
    ("what's good for dorm", {"cats": make_cats("get_recommendations")}),
    ("essential items", {"cats": make_cats("get_recommendations")}),
    ("must have items", {"cats": make_cats("get_recommendations")}),
    ("top selling products", {"cats": make_cats("get_recommendations")}),
    ("highest rated", {"cats": make_cats("get_recommendations")}),
    ("five star items", {"cats": make_cats("get_recommendations")}),
    ("well reviewed products", {"cats": make_cats("get_recommendations")}),
    ("what's recommended", {"cats": make_cats("get_recommendations")}),
    ("suggest items", {"cats": make_cats("get_recommendations")}),
    ("best products", {"cats": make_cats("get_recommendations")}),
    ("what do others buy", {"cats": make_cats("get_recommendations")}),
    ("most purchased", {"cats": make_cats("get_recommendations")}),
    ("frequently bought", {"cats": make_cats("get_recommendations")}),
    
    # =========================================================================
    # help intent (~50 examples)
    # =========================================================================
    ("what can you do", {"cats": make_cats("help")}),
    ("help me", {"cats": make_cats("help")}),
    ("how does this work", {"cats": make_cats("help")}),
    ("what are your capabilities", {"cats": make_cats("help")}),
    ("help", {"cats": make_cats("help")}),
    ("what can I ask", {"cats": make_cats("help")}),
    ("how to use this", {"cats": make_cats("help")}),
    ("show me what you can do", {"cats": make_cats("help")}),
    ("what services do you offer", {"cats": make_cats("help")}),
    ("commands", {"cats": make_cats("help")}),
    ("menu", {"cats": make_cats("help")}),
    ("options", {"cats": make_cats("help")}),
    ("instructions", {"cats": make_cats("help")}),
    ("guide me", {"cats": make_cats("help")}),
    ("I need assistance", {"cats": make_cats("help")}),
    ("what are you capable of", {"cats": make_cats("help")}),
    ("how can you help", {"cats": make_cats("help")}),
    ("what help do you offer", {"cats": make_cats("help")}),
    ("explain yourself", {"cats": make_cats("help")}),
    ("what is this", {"cats": make_cats("help")}),
    ("how do I use you", {"cats": make_cats("help")}),
    ("what do you do", {"cats": make_cats("help")}),
    ("tell me about yourself", {"cats": make_cats("help")}),
    ("what's your purpose", {"cats": make_cats("help")}),
    ("why are you here", {"cats": make_cats("help")}),
    ("what can you help with", {"cats": make_cats("help")}),
    ("show capabilities", {"cats": make_cats("help")}),
    ("list your features", {"cats": make_cats("help")}),
    ("what features do you have", {"cats": make_cats("help")}),
    ("available commands", {"cats": make_cats("help")}),
    ("show me options", {"cats": make_cats("help")}),
    ("what are my options", {"cats": make_cats("help")}),
    ("how do you work", {"cats": make_cats("help")}),
    ("explain how to use", {"cats": make_cats("help")}),
    ("tutorial", {"cats": make_cats("help")}),
    ("getting started", {"cats": make_cats("help")}),
    ("user guide", {"cats": make_cats("help")}),
    ("how to start", {"cats": make_cats("help")}),
    ("what should I do", {"cats": make_cats("help")}),
    ("I'm confused", {"cats": make_cats("help")}),
    ("I don't understand", {"cats": make_cats("help")}),
    ("I need help", {"cats": make_cats("help")}),
    ("can you help me", {"cats": make_cats("help")}),
    ("assist me", {"cats": make_cats("help")}),
    ("I'm lost", {"cats": make_cats("help")}),
    ("what now", {"cats": make_cats("help")}),
    ("what next", {"cats": make_cats("help")}),
    ("guide", {"cats": make_cats("help")}),
    ("info", {"cats": make_cats("help")}),
    ("information", {"cats": make_cats("help")}),
]


# =============================================================================
# NAMED ENTITY RECOGNITION (NER) TRAINING DATA
# =============================================================================

NER_TRAINING_DATA = [
    # PRODUCT entities
    ("find laptops under 500", {"entities": [(5, 12, "PRODUCT"), (19, 22, "PRICE")]}),
    ("show me cheap books", {"entities": [(14, 19, "PRODUCT")]}),
    ("I need a calculator", {"entities": [(9, 19, "PRODUCT")]}),
    ("looking for headphones", {"entities": [(12, 22, "PRODUCT")]}),
    ("search for monitors", {"entities": [(11, 19, "PRODUCT")]}),
    ("find me a keyboard", {"entities": [(10, 18, "PRODUCT")]}),
    ("show backpacks", {"entities": [(5, 14, "PRODUCT")]}),
    ("I want notebooks", {"entities": [(7, 16, "PRODUCT")]}),
    ("looking for hoodie", {"entities": [(12, 18, "PRODUCT")]}),
    ("find running shoes", {"entities": [(5, 18, "PRODUCT")]}),
    ("show me desk lamp", {"entities": [(8, 17, "PRODUCT")]}),
    ("search yoga mat", {"entities": [(7, 15, "PRODUCT")]}),
    ("find water bottle", {"entities": [(5, 17, "PRODUCT")]}),
    ("I need an umbrella", {"entities": [(10, 18, "PRODUCT")]}),
    ("looking for textbook", {"entities": [(12, 20, "PRODUCT")]}),
    ("find AirPods", {"entities": [(5, 12, "PRODUCT")]}),
    ("show me MacBook", {"entities": [(8, 15, "PRODUCT")]}),
    ("search for iPhone charger", {"entities": [(11, 25, "PRODUCT")]}),
    ("looking for USB cable", {"entities": [(12, 21, "PRODUCT")]}),
    ("find wireless mouse", {"entities": [(5, 19, "PRODUCT")]}),
    ("show me highlighters", {"entities": [(8, 20, "PRODUCT")]}),
    ("I need pens", {"entities": [(7, 11, "PRODUCT")]}),
    ("search for tennis racket", {"entities": [(11, 24, "PRODUCT")]}),
    ("find mirror", {"entities": [(5, 11, "PRODUCT")]}),
    ("looking for jacket", {"entities": [(12, 18, "PRODUCT")]}),
    
    # CATEGORY entities
    ("show me electronics", {"entities": [(8, 19, "CATEGORY")]}),
    ("find items in books category", {"entities": [(14, 19, "CATEGORY")]}),
    ("search clothing", {"entities": [(7, 15, "CATEGORY")]}),
    ("browse stationery", {"entities": [(7, 17, "CATEGORY")]}),
    ("show accessories", {"entities": [(5, 16, "CATEGORY")]}),
    ("find products in electronics", {"entities": [(17, 28, "CATEGORY")]}),
    ("browse books section", {"entities": [(7, 12, "CATEGORY")]}),
    ("show me clothing items", {"entities": [(8, 16, "CATEGORY")]}),
    ("search in stationery", {"entities": [(10, 20, "CATEGORY")]}),
    ("accessories category", {"entities": [(0, 11, "CATEGORY")]}),
    
    # PRICE entities
    ("under 100 dollars", {"entities": [(6, 9, "PRICE")]}),
    ("less than 50", {"entities": [(10, 12, "PRICE")]}),
    ("around 200", {"entities": [(7, 10, "PRICE")]}),
    ("between 10 and 50", {"entities": [(8, 10, "PRICE"), (15, 17, "PRICE")]}),
    ("maximum 500", {"entities": [(8, 11, "PRICE")]}),
    ("budget of 30", {"entities": [(10, 12, "PRICE")]}),
    ("items under 25", {"entities": [(12, 14, "PRICE")]}),
    ("products below 75", {"entities": [(15, 17, "PRICE")]}),
    ("above 100", {"entities": [(6, 9, "PRICE")]}),
    ("over 150", {"entities": [(5, 8, "PRICE")]}),
    
    # CONDITION entities
    ("find new laptops", {"entities": [(5, 8, "CONDITION"), (9, 16, "PRODUCT")]}),
    ("looking for used textbooks", {"entities": [(12, 16, "CONDITION"), (17, 26, "PRODUCT")]}),
    ("show me brand new items", {"entities": [(8, 17, "CONDITION")]}),
    ("second hand books", {"entities": [(0, 11, "CONDITION"), (12, 17, "PRODUCT")]}),
    ("like new condition", {"entities": [(0, 8, "CONDITION")]}),
    ("barely used laptop", {"entities": [(0, 11, "CONDITION"), (12, 18, "PRODUCT")]}),
    
    # Combined examples
    ("find cheap laptops under 100", {"entities": [(11, 18, "PRODUCT"), (25, 28, "PRICE")]}),
    ("show me new books in electronics", {"entities": [(8, 11, "CONDITION"), (12, 17, "PRODUCT"), (21, 32, "CATEGORY")]}),
    ("I need a used calculator for under 50", {"entities": [(9, 13, "CONDITION"), (14, 24, "PRODUCT"), (35, 37, "PRICE")]}),
    ("find laptops in electronics above 200", {"entities": [(5, 12, "PRODUCT"), (16, 27, "CATEGORY"), (34, 37, "PRICE")]}),
    ("show me headphones under 100", {"entities": [(8, 18, "PRODUCT"), (25, 28, "PRICE")]}),
    ("looking for books below 30", {"entities": [(12, 17, "PRODUCT"), (24, 26, "PRICE")]}),
]


# =============================================================================
# PRODUCT & CATEGORY KEYWORDS (for data augmentation)
# =============================================================================

PRODUCT_KEYWORDS = [
    "laptop", "laptops", "computer", "notebook", "notebooks",
    "book", "books", "textbook", "textbooks",
    "headphones", "earbuds", "airpods",
    "keyboard", "keyboards", "mouse",
    "monitor", "monitors", "screen",
    "backpack", "bag", "bags",
    "calculator", "calculators",
    "hoodie", "hoodies", "jacket", "coat",
    "shoes", "sneakers",
    "lamp", "desk lamp",
    "bottle", "water bottle",
    "pen", "pens", "highlighter", "highlighters",
    "yoga mat", "tennis racket", "umbrella",
    "charger", "cable", "usb",
]

CATEGORY_KEYWORDS = [
    "electronics", "books", "clothing", "stationery", "accessories"
]
