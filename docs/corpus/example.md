# Example Knowledge Base Document

This is an example document in the corpus directory. The bot will use this content to answer questions.

## About This Project

This project demonstrates how to build a Telegram bot that uses Retrieval Augmented Generation (RAG) to answer questions based on a knowledge base.

## How RAG Works

RAG combines two capabilities: retrieval (finding relevant documents) and generation (producing natural language answers). When a user asks a question, the system first searches for relevant document chunks using semantic similarity, then passes those chunks as context to the language model.

## Getting Started

To add your own knowledge to this bot, create markdown or text files in this docs/corpus/ directory, then run the ingest script to embed them into the vector database.
