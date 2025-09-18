from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import pipeline
import logging
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Text Summarization API",
    description="API for summarizing text using DistilBART model",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize the summarization pipeline
try:
    summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
    logger.info("Summarization model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    summarizer = None

# Pydantic models
class TextInput(BaseModel):
    text: str = Field(..., description="Text to summarize", min_length=50)
    max_length: Optional[int] = Field(100, description="Maximum length of summary", ge=30, le=500)
    min_length: Optional[int] = Field(50, description="Minimum length of summary", ge=10, le=200)
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by humans and other animals. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of successfully achieving its goals.",
                "max_length": 100,
                "min_length": 50
            }
        }

class SummaryResponse(BaseModel):
    summary: str = Field(..., description="Generated summary")
    original_length: int = Field(..., description="Length of original text")
    summary_length: int = Field(..., description="Length of summary")

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Text Summarization API",
        "version": "1.0.0",
        "endpoints": {
            "/summarize": "POST - Summarize text",
            "/health": "GET - Health check",
            "/docs": "GET - API documentation"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    model_status = "healthy" if summarizer is not None else "unhealthy"
    return {
        "status": "healthy" if summarizer is not None else "unhealthy",
        "model_status": model_status
    }

@app.post("/summarize", response_model=SummaryResponse)
async def summarize_text(input_data: TextInput):
    """
    Summarize the provided text using DistilBART model
    
    - **text**: The text to summarize (minimum 50 characters)
    - **max_length**: Maximum length of the summary (default: 100)
    - **min_length**: Minimum length of the summary (default: 50)
    """
    try:
        if summarizer is None:
            raise HTTPException(status_code=503, detail="Summarization model is not available")
        
        # Validate min_length vs max_length
        if input_data.min_length >= input_data.max_length:
            raise HTTPException(
                status_code=400, 
                detail="min_length must be less than max_length"
            )
        
        # Generate summary
        result = summarizer(
            input_data.text,
            max_length=input_data.max_length,
            min_length=input_data.min_length,
            do_sample=False
        )
        
        summary_text = result[0]['summary_text']
        
        return SummaryResponse(
            summary=summary_text,
            original_length=len(input_data.text),
            summary_length=len(summary_text)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during summarization: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.options("/summarize")
async def summarize_options() -> Response:
    # Explicit preflight handler to avoid 404s from proxies/tools that don't send CORS headers
    return Response(status_code=200, headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
