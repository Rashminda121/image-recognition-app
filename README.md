# Image Recognition Service

An image recognition service built with AWS Rekognition that detects objects, labels, and confidence scores from uploaded images.

## Features

- Upload images for analysis
- Detect objects and labels using AWS Rekognition
- Return confidence scores for detected results

## Environment Variables

Create a `.env` file in the project root and add the API URL for the image recognition backend:

```
REACT_APP_IMAGE_RECOGNITION_API_URL=https://api-url.example.com/analyze-image
```

Restart the development server after updating `.env` so React picks up the new value.
