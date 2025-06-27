#!/bin/bash

# Python仮想環境の作成（初回のみ）
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# 仮想環境の有効化
source venv/bin/activate

# 依存関係のインストール
echo "Installing dependencies..."
pip install -r requirements.txt

# Tesseractのインストール確認
if ! command -v tesseract &> /dev/null; then
    echo "Tesseract is not installed. Installing..."
    brew install tesseract
    brew install tesseract-lang  # 日本語言語パック
fi

# Pythonサーバーの起動
echo "Starting OCR server..."
python ocr_server.py 