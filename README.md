# Memora - Human Memories Management System

Memora is a sophisticated application designed to store, manage, and retrieve personal memories using a hybrid database system combining vector and graph databases.

## Features

- Store memories with text, media, and tags
- Search by feeling using vector similarity
- Search by connections using graph relationships
- Timeline and mood map visualizations
- Secure authentication and data privacy

## Tech Stack

- Frontend: React
- Backend: Node.js with Express
- Vector Database: Pinecone
- Graph Database: Neo4j
- Media Storage: Amazon S3
- Authentication: Firebase
- Embedding Model: SentenceTransformers (all-MiniLM-L6-v2)

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Pinecone account
- Neo4j instance
- AWS S3 bucket
- Firebase project

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Backend (.env)
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_ENVIRONMENT=your_pinecone_env
   NEO4J_URI=your_neo4j_uri
   NEO4J_USER=your_neo4j_user
   NEO4J_PASSWORD=your_neo4j_password
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   FIREBASE_CONFIG=your_firebase_config
   ```

## Development

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

## Architecture

The application uses a three-tier architecture:

1. **Presentation Layer (UI)**
   - React components
   - Redux for state management
   - Material-UI for components

2. **Application Layer (API)**
   - Node.js with Express
   - RESTful endpoints
   - Authentication middleware

3. **Data Layer**
   - Pinecone for vector similarity search
   - Neo4j for graph relationships
   - S3 for media storage

## API Endpoints

- `POST /api/memories` - Add a new memory
- `GET /api/memories/search` - Search memories
- `GET /api/memories/timeline` - Get timeline data
- `GET /api/memories/moodmap` - Get mood map data

## Security

- Firebase Authentication
- HTTPS encryption
- Data encryption at rest
- Access control in Neo4j

## License

MIT License 