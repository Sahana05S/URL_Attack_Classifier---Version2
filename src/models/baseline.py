import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from typing import List, Union
from src.schema.events import UnifiedEvent

class TFIDFClassifier:
    """
    Baseline Model A: TF-IDF + Logistic Regression for Attack Type Classification.
    Features: URL + Payload (concatenated)
    Target: Attack Type
    """
    
    def __init__(self):
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(max_features=5000, analyzer='char_wb', ngram_range=(2, 4))),
            ('clf', LogisticRegression(class_weight='balanced', max_iter=1000))
        ])
        self.is_trained = False

    def _extract_features(self, events: List[UnifiedEvent]) -> List[str]:
        """Combine URL and Payload into a single text feature."""
        features = []
        for e in events:
            # Combine method + url + payload
            text = f"{e.method} {e.url} {e.payload or ''}"
            features.append(text)
        return features

    def train(self, events: List[UnifiedEvent]):
        X = self._extract_features(events)
        y = [e.attack_type for e in events]
        self.pipeline.fit(X, y)
        self.is_trained = True
        print("TF-IDF Classifier trained successfully.")

    def predict(self, events: List[UnifiedEvent]) -> List[str]:
        if not self.is_trained:
            raise ValueError("Model is not trained.")
        X = self._extract_features(events)
        return self.pipeline.predict(X).tolist()
    
    def save(self, path: str):
        with open(path, 'wb') as f:
            pickle.dump(self.pipeline, f)
            
    def load(self, path: str):
        with open(path, 'rb') as f:
            self.pipeline = pickle.load(f)
        self.is_trained = True
