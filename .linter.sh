#!/bin/bash
cd /home/kavia/workspace/code-generation/timetalks-interactive-historical--future-chat-45314-359cb233/timetalks
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

