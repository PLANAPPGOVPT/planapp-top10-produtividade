#!/usr/bin/env bash
# setup-copilot-foundry.sh
# Configura o gh copilot CLI para usar modelos do Microsoft Foundry (BYOK)

set -e

RESOURCE_NAME="hugomoreira-9276-resource"
RESOURCE_GROUP="pla-we-nprd-prisma-rg001"
SUBSCRIPTION="e00af217-2e9b-4bcc-a0f3-1f2225db4031"

echo "🔑 A obter chave API do Azure Cognitive Services..."
FOUNDRY_KEY=$(az cognitiveservices account keys list \
  --name "$RESOURCE_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --subscription "$SUBSCRIPTION" \
  --query "key1" -o tsv)

if [ -z "$FOUNDRY_KEY" ]; then
  echo "❌ Falha ao obter a chave API. Verifica se o az login está feito."
  exit 1
fi

echo "✅ Chave obtida com sucesso."

# Adiciona ao ~/.bashrc se ainda não existir
RC_FILE="$HOME/.bashrc"
MARKER="# === gh-copilot-foundry-config ==="

if ! grep -q "$MARKER" "$RC_FILE" 2>/dev/null; then
  echo "" >> "$RC_FILE"
  echo "$MARKER" >> "$RC_FILE"
  echo "export FOUNDRY_KEY=\"$FOUNDRY_KEY\"" >> "$RC_FILE"
  echo "" >> "$RC_FILE"
  echo '# Aliases para modelos do Foundry no gh copilot' >> "$RC_FILE"
  echo 'alias copilot-gpt="COPILOT_PROVIDER_TYPE=azure COPILOT_PROVIDER_BASE_URL=https://hugomoreira-9276-resource.openai.azure.com COPILOT_PROVIDER_API_KEY=\$FOUNDRY_KEY COPILOT_PROVIDER_MODEL_ID=gpt-5.4 COPILOT_PROVIDER_WIRE_MODEL=gpt-5.4 COPILOT_PROVIDER_AZURE_API_VERSION=2025-01-01-preview gh copilot"' >> "$RC_FILE"
  echo 'alias copilot-kimi="COPILOT_PROVIDER_TYPE=azure COPILOT_PROVIDER_BASE_URL=https://hugomoreira-9276-resource.services.ai.azure.com COPILOT_PROVIDER_API_KEY=\$FOUNDRY_KEY COPILOT_PROVIDER_WIRE_MODEL=Kimi-K2.6 COPILOT_PROVIDER_AZURE_API_VERSION=2024-05-01-preview gh copilot --model Kimi-K2.6"' >> "$RC_FILE"
  echo 'alias copilot-deepseek="COPILOT_PROVIDER_TYPE=azure COPILOT_PROVIDER_BASE_URL=https://hugomoreira-9276-resource.services.ai.azure.com COPILOT_PROVIDER_API_KEY=\$FOUNDRY_KEY COPILOT_PROVIDER_WIRE_MODEL=DeepSeek-V4-Pro COPILOT_PROVIDER_AZURE_API_VERSION=2024-05-01-preview gh copilot --model DeepSeek-V4-Pro"' >> "$RC_FILE"
  echo "" >> "$RC_FILE"
  echo '# Wrapper interativo para escolher modelo' >> "$RC_FILE"
  echo 'copilot-foundry() {' >> "$RC_FILE"
  echo '  echo "Escolhe o modelo:"' >> "$RC_FILE"
  echo '  echo "  1) gpt-5.4"' >> "$RC_FILE"
  echo '  echo "  2) Kimi-K2.6"' >> "$RC_FILE"
  echo '  echo "  3) DeepSeek-V4-Pro"' >> "$RC_FILE"
  echo '  read -rp "Opção [1-3]: " opt' >> "$RC_FILE"
  echo '  case $opt in' >> "$RC_FILE"
  echo '    1) copilot-gpt ;;' >> "$RC_FILE"
  echo '    2) copilot-kimi ;;' >> "$RC_FILE"
  echo '    3) copilot-deepseek ;;' >> "$RC_FILE"
  echo '    *) echo "Inválido" ;;' >> "$RC_FILE"
  echo '  esac' >> "$RC_FILE"
  echo '}' >> "$RC_FILE"
  echo "✅ Configuração adicionada a $RC_FILE"
else
  echo "⚠️ Configuração já existe em $RC_FILE, a atualizar chave..."
  sed -i "s|export FOUNDRY_KEY=\".*\"|export FOUNDRY_KEY=\"$FOUNDRY_KEY\"|" "$RC_FILE"
fi

echo ""
echo "🎉 Pronto! Recarrega o shell com:"
echo "   source ~/.bashrc"
echo ""
echo "Depois usa:"
echo "   copilot-gpt         → GPT-5.4"
echo "   copilot-kimi        → Kimi-K2.6"
echo "   copilot-deepseek    → DeepSeek-V4-Pro"
echo "   copilot-foundry     → menu interativo"
