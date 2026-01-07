import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix
from typing import List
import os

class Evaluator:
    """
    Evaluates model predictions and saves metrics/plots.
    """
    
    @staticmethod
    def evaluate(y_true: List[str], y_pred: List[str], class_labels: List[str], output_dir: str = "eval_results"):
        """
        Prints classification report and saves confusion matrix image.
        """
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        # 1. Classification Report
        print("Classification Report:")
        report = classification_report(y_true, y_pred, target_names=class_labels, zero_division=0)
        print(report)
        
        with open(f"{output_dir}/report.txt", "w") as f:
            f.write(report)
            
        # 2. Confusion Matrix
        cm = confusion_matrix(y_true, y_pred, labels=class_labels)
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', xticklabels=class_labels, yticklabels=class_labels, cmap='Blues')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        plt.title('Confusion Matrix')
        plt.tight_layout()
        plt.savefig(f"{output_dir}/confusion_matrix.png")
        plt.close()
        
        print(f"Evaluation artifacts saved to {output_dir}")
