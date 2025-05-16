import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from transformers import pipeline

# Initialize embedding model
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Initialize summarization model
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

### Embedding Functions ###
def embed_text(text):
    """Convert text into an embedding vector."""
    return model.encode([text])[0]

def build_faiss_index(vectors):
    """Build a FAISS index for similarity search."""
    if not vectors:
        raise ValueError("No vectors provided for FAISS indexing")
    
    dim = len(vectors[0])
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(vectors).astype("float32"))
    return index

def search_faiss(index, query_vector, k=3):
    """Search for the most relevant sentences based on similarity."""
    if index is None:
        raise ValueError("FAISS index not initialized")
    
    query_vector = np.array([query_vector]).astype("float32")
    distances, indices = index.search(query_vector, k)
    return indices[0], distances[0]

### Response Structuring ###
def structure_response(top_sentences):
    """Generate a structured response summary from top retrieved sentences."""
    if not top_sentences:
        return "No relevant information found."
    
    seen = set()
    unique_sentences = [sent.strip() for sent in top_sentences if sent.strip() and sent.strip() not in seen]
    seen.update(unique_sentences)

    combined_text = " ".join(unique_sentences)

    # Generate summary based on combined relevant sentences
    summary_output = summarizer(
        combined_text,
        max_length=500,
        min_length=30,
        do_sample=False
    )
    
    return summary_output[0]['summary_text']