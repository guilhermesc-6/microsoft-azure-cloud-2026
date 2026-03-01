const API_URL = 'http://localhost:7032/api/barcode-generator';
const VALIDATE_URL = 'http://localhost:7033/api/barcode-validate';

// Elementos do DOM
const barcodeForm = document.getElementById('barcodeForm');
const resultSection = document.getElementById('resultSection');
const loadingSpinner = document.getElementById('loadingSpinner');
const messageContainer = document.getElementById('messageContainer');
const barcodeImage = document.getElementById('barcodeImage');
const barcodeCode = document.getElementById('barcodeCode');
const infoValor = document.getElementById('infoValor');
const infoVencimento = document.getElementById('infoVencimento');

let ultimoCodigo = null;

// Event Listener do formulário
barcodeForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const valor = parseFloat(document.getElementById('valor').value);
  const dataVencimento = document.getElementById('dataVencimento').value;

  if (!valor || !dataVencimento) {
    mostrarMensagem('Por favor, preencha todos os campos', 'error');
    return;
  }

  await gerarCodigoBarras(valor, dataVencimento);
});

// Função para gerar código de barras
async function gerarCodigoBarras(valor, dataVencimento) {
  try {
    // Mostrar loading
    loadingSpinner.style.display = 'flex';
    resultSection.style.display = 'none';

    // Preparar payload
    const payload = {
      valor: valor,
      dataVencimento: dataVencimento,
    };

    // Fazer requisição
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Erro ao gerar código: ${response.status}`,
      );
    }

    const data = await response.json();

    if (!data.barcode || !data.imagemBase64) {
      throw new Error('Resposta inválida da API');
    }

    // Armazenar código para copiar depois
    ultimoCodigo = data.barcode;

    // Preencher formulário de resultado
    barcodeCode.textContent = data.barcode;
    barcodeImage.src = `data:image/png;base64,${data.imagemBase64}`;
    barcodeImage.alt = `Código de Barras: ${data.barcode}`;

    // preencher campo de validação e limpar feedback anterior
    const barcodeInput = document.getElementById('barcodeInput');
    if (barcodeInput) {
      barcodeInput.value = data.barcode;
    }
    const validationResult = document.getElementById('validationResult');
    if (validationResult) {
      validationResult.textContent = '';
      validationResult.className = 'validation-result';
    }

    // Formatar valores
    infoValor.textContent = `R$ ${valor.toFixed(2).replace('.', ',')}`;
    infoVencimento.textContent = formatarData(dataVencimento);

    // Mostrar resultado
    loadingSpinner.style.display = 'none';
    resultSection.style.display = 'block';

    mostrarMensagem('✅ Código de barras gerado com sucesso!', 'success');

    // validar automaticamente usando o código gerado
    setTimeout(() => {
      validarCodigo();
    }, 100); // pequeno delay para garantir DOM atualizado
  } catch (error) {
    console.error('Erro:', error);
    loadingSpinner.style.display = 'none';
    mostrarMensagem(`❌ ${error.message}`, 'error');
  }
}

// Função para copiar código
function copiarCodigo() {
  if (!ultimoCodigo) return;

  navigator.clipboard
    .writeText(ultimoCodigo)
    .then(() => {
      mostrarMensagem(
        '✅ Código copiado para a área de transferência!',
        'success',
      );
    })
    .catch(() => {
      mostrarMensagem('❌ Erro ao copiar código', 'error');
    });
}

// Função para baixar imagem
function downloadBarcode() {
  if (!barcodeImage.src) return;

  const link = document.createElement('a');
  link.href = barcodeImage.src;
  link.download = `barcode-${ultimoCodigo || 'download'}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  mostrarMensagem('✅ Imagem baixada com sucesso!', 'success');
}

// Função para gerar novo código
function novoBarcode() {
  // Limpar formulário
  barcodeForm.reset();

  // Ocultar resultado
  resultSection.style.display = 'none';

  // Focar no campo de valor
  document.getElementById('valor').focus();

  mostrarMensagem('✅ Pronto para gerar um novo código', 'success');
}

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'success') {
  const message = document.createElement('div');
  message.className = `message ${tipo}`;
  message.textContent = texto;

  messageContainer.appendChild(message);

  // Remover mensagem após 4 segundos
  setTimeout(() => {
    message.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      messageContainer.removeChild(message);
    }, 300);
  }, 4000);
}

// Função para validar código de barras
async function validarCodigo() {
  const input = document.getElementById('barcodeInput');
  let code = input ? input.value.trim() : '';
  if (!code && ultimoCodigo) {
    code = ultimoCodigo;
    if (input) input.value = code;
  }
  if (!code) {
    mostrarMensagem('Informe ou gere um código para validar', 'error');
    return;
  }

  try {
    // make sure area is visible (in case user manually validates)
    if (resultSection && resultSection.style.display === 'none') {
      resultSection.style.display = 'block';
    }
    loadingSpinner.style.display = 'flex';
    const resp = await fetch(VALIDATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode: code }),
    });

    const resultDiv = document.getElementById('validationResult');
    if (!resp.ok) {
      // try to read error message from body
      const errData = await resp.json().catch(() => ({}));
      const messageText = errData.message || `Status ${resp.status}`;
      if (resultDiv) {
        resultDiv.className = 'validation-result error';
        resultDiv.textContent = messageText;
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      throw new Error(messageText);
    }

    const data = await resp.json();
    if (resultDiv) {
      if (data.valido) {
        resultDiv.className = 'validation-result success';
        resultDiv.textContent = `${data.mensagem} (vencimento: ${data.vencimento})`;
      } else {
        resultDiv.className = 'validation-result error';
        resultDiv.textContent = data.mensagem || 'Boleto inválido';
      }
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    mostrarMensagem(
      data.valido ? '✅ Boleto válido' : '❌ Boleto inválido',
      data.valido ? 'success' : 'error',
    );
  } catch (err) {
    console.error(err);
    mostrarMensagem(`❌ ${err.message}`, 'error');
  } finally {
    loadingSpinner.style.display = 'none';
  }
}

// Função para formatar data
function formatarData(data) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Inicializar
console.log('🚀 Aplicação iniciada e pronta para usar');
console.log(`📡 API URL: ${API_URL}`);
