from src.generation.synthetic import SyntheticLogGenerator
from src.ingestion.loader import DataLoader
from src.models.baseline import TFIDFClassifier
from src.evaluation.evaluator import Evaluator
import os

def run_pipeline():
    print("1. Generating Synthetic Data...")
    gen = SyntheticLogGenerator(seed=42)
    train_events = gen.generate_events(200)
    test_events = gen.generate_events(50)
    
    # Save to temp CSV to verify ingestion round-trip (optional, but good for testing)
    # For now, we work with objects directly to speed up verification
    
    print("2. Training TF-IDF Classifier...")
    clf = TFIDFClassifier()
    clf.train(train_events)
    
    print("3. Predicting on Test Set...")
    y_true = [e.attack_type for e in test_events]
    y_pred = clf.predict(test_events)
    
    print("4. Evaluating...")
    labels = sorted(list(set(y_true) | set(y_pred)))
    Evaluator.evaluate(y_true, y_pred, labels)
    
    print("Pipeline Verification Complete!")

if __name__ == "__main__":
    run_pipeline()
