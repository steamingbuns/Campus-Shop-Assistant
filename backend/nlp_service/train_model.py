"""
Training script for the Campus Shop Assistant NLP model.

This script trains a spaCy model with:
1. Text Classification (textcat) for intent detection
2. Named Entity Recognition (NER) for entity extraction

Usage:
    python train_model.py

Output:
    models/campus_shop_nlp - Trained model directory
"""

import spacy
from spacy.training import Example
from spacy.util import minibatch, compounding
import random
from pathlib import Path
from training_data import TEXTCAT_TRAINING_DATA, NER_TRAINING_DATA


def create_training_examples_textcat(nlp, data):
    """Convert textcat training data to spaCy Example objects."""
    examples = []
    for text, annotations in data:
        doc = nlp.make_doc(text)
        example = Example.from_dict(doc, annotations)
        examples.append(example)
    return examples


def create_training_examples_ner(nlp, data):
    """Convert NER training data to spaCy Example objects."""
    examples = []
    for text, annotations in data:
        doc = nlp.make_doc(text)
        example = Example.from_dict(doc, annotations)
        examples.append(example)
    return examples


def train_textcat(nlp, train_data, n_iter=30):
    """Train text classification component."""
    print("\n=== Training Text Classifier ===")
    
    # Add textcat component
    if "textcat" not in nlp.pipe_names:
        textcat = nlp.add_pipe("textcat", last=True)
    else:
        textcat = nlp.get_pipe("textcat")
    
    # Add labels
    labels = set()
    for _, annotations in train_data:
        for label in annotations["cats"]:
            labels.add(label)
    
    for label in labels:
        textcat.add_label(label)
    
    print(f"Labels: {labels}")
    
    # Create examples
    examples = create_training_examples_textcat(nlp, train_data)
    
    # Get only textcat pipe for training
    other_pipes = [pipe for pipe in nlp.pipe_names if pipe != "textcat"]
    
    # Train
    with nlp.disable_pipes(*other_pipes):
        optimizer = nlp.begin_training()
        
        for i in range(n_iter):
            random.shuffle(examples)
            losses = {}
            
            batches = minibatch(examples, size=compounding(4.0, 32.0, 1.001))
            for batch in batches:
                nlp.update(batch, sgd=optimizer, losses=losses)
            
            if (i + 1) % 5 == 0:
                print(f"  Iteration {i + 1}/{n_iter}, Loss: {losses.get('textcat', 0):.4f}")
    
    return nlp


def train_ner(nlp, train_data, n_iter=30):
    """Train NER component."""
    print("\n=== Training NER ===")
    
    # Add NER component if not present
    if "ner" not in nlp.pipe_names:
        ner = nlp.add_pipe("ner", before="textcat" if "textcat" in nlp.pipe_names else None)
    else:
        ner = nlp.get_pipe("ner")
    
    # Add labels
    labels = set()
    for _, annotations in train_data:
        for _, _, label in annotations.get("entities", []):
            labels.add(label)
    
    for label in labels:
        ner.add_label(label)
    
    print(f"Labels: {labels}")
    
    # Create examples
    examples = create_training_examples_ner(nlp, train_data)
    
    # Get only ner pipe for training
    other_pipes = [pipe for pipe in nlp.pipe_names if pipe != "ner"]
    
    # Train
    with nlp.disable_pipes(*other_pipes):
        optimizer = nlp.begin_training()
        
        for i in range(n_iter):
            random.shuffle(examples)
            losses = {}
            
            batches = minibatch(examples, size=compounding(4.0, 32.0, 1.001))
            for batch in batches:
                nlp.update(batch, sgd=optimizer, losses=losses)
            
            if (i + 1) % 5 == 0:
                print(f"  Iteration {i + 1}/{n_iter}, Loss: {losses.get('ner', 0):.4f}")
    
    return nlp


def evaluate_model(nlp, test_texts):
    """Quick evaluation of the trained model."""
    print("\n=== Model Evaluation ===")
    
    for text in test_texts:
        doc = nlp(text)
        
        print(f"\nText: '{text}'")
        
        # Intent (textcat)
        if doc.cats:
            best_cat = max(doc.cats.items(), key=lambda x: x[1])
            print(f"  Intent: {best_cat[0]} (confidence: {best_cat[1]:.2f})")
        
        # Entities
        if doc.ents:
            print(f"  Entities: {[(ent.text, ent.label_) for ent in doc.ents]}")
        else:
            print("  Entities: None")


def main():
    print("=" * 60)
    print("Campus Shop Assistant - NLP Model Training")
    print("=" * 60)
    
    # Create a blank English model
    nlp = spacy.blank("en")
    
    # Train NER first
    nlp = train_ner(nlp, NER_TRAINING_DATA, n_iter=50)
    
    # Train textcat
    nlp = train_textcat(nlp, TEXTCAT_TRAINING_DATA, n_iter=50)
    
    # Save model
    output_dir = Path("models/campus_shop_nlp")
    output_dir.mkdir(parents=True, exist_ok=True)
    nlp.to_disk(output_dir)
    print(f"\n✅ Model saved to: {output_dir}")
    
    # Test the model with 5 core intents
    test_texts = [
        # search_product (primary use case)
        "find laptops under 500",
        "show me cheap books",
        "search for used textbooks",
        "I need a new keyboard",
        "looking for electronics under 100",
        "do you have any hoodies",
        "browse clothing section",
        "show me backpacks",
        
        # greeting
        "hello",
        "hi there",
        "good morning",
        "hey",
        
        # ask_price
        "how much is this",
        "price of the calculator",
        "what does this cost",
        "how much for the laptop",
        
        # get_recommendations
        "what do you recommend",
        "suggest something for a student",
        "what's popular",
        "best sellers",
        
        # help
        "what can you do",
        "help me",
        "how does this work",
    ]
    
    # Load and test
    print("\n" + "=" * 60)
    print("Loading and testing the saved model...")
    print("=" * 60)
    
    nlp_loaded = spacy.load(output_dir)
    evaluate_model(nlp_loaded, test_texts)
    
    print("\n✅ Training complete!")
    print(f"\nTo use this model, set: SPACY_MODEL=models/campus_shop_nlp")


if __name__ == "__main__":
    main()
