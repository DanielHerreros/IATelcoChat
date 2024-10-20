import './style.css';
import { marked } from 'marked';
import OpenAI from 'openai';

// Definimos una interfaz para la respuesta de la API
interface ApiResponse {
  content: string;
}

// Función para inicializar la aplicación
function initApp() {
  const apiKeyDialog = document.getElementById('apiKeyDialog') as HTMLDialogElement;
  const openApiKeyDialogBtn = document.getElementById('openApiKeyDialogBtn') as HTMLAnchorElement;
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn') as HTMLButtonElement;
  const apiKeyInput = document.getElementById('apiKeyInput') as HTMLInputElement;
  const companySelect = document.getElementById('companySelect') as HTMLSelectElement;
  const queryInput = document.getElementById('queryInput') as HTMLTextAreaElement;
  const submitQueryBtn = document.getElementById('submitQueryBtn') as HTMLButtonElement;
  const responseDisplay = document.getElementById('responseDisplay') as HTMLDivElement;

  // Evento para abrir el diálogo de API Key
  openApiKeyDialogBtn.addEventListener('click', () => {
    apiKeyDialog.showModal();
  });

  // Evento para guardar la API Key
  saveApiKeyBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      localStorage.setItem('openai_api_key', apiKey);
      apiKeyDialog.close();
    } else {
      alert('Por favor, introduce una API Key válida.');
    }
  });

  // Evento para enviar una consulta
  submitQueryBtn.addEventListener('click', async () => {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      alert('Por favor, configura tu API Key primero.');
      return;
    }

    const company = companySelect.value;
    const query = queryInput.value.trim();
    if (!query) {
      alert('Por favor, escribe una consulta.');
      return;
    }

    try {
      const response = await sendQuery(apiKey, company, query);
      const markedContent = await Promise.resolve(marked(response.content));
      responseDisplay.innerHTML = markedContent;
    } catch (error) {
      console.error('Error al enviar la consulta:', error);
      responseDisplay.textContent = 'Hubo un error al procesar tu consulta. Por favor, intenta de nuevo.';
    }
  });
}

// Función para enviar la consulta a la API de OpenAI
async function sendQuery(apiKey: string, company: string, query: string): Promise<ApiResponse> {
  const openai = new OpenAI({ apiKey: apiKey });

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: `Eres un experto en servicios de telefonía, especialmente en la compañía ${company}. Proporciona información precisa y útil sobre sus servicios, planes y ofertas.` },
      { role: "user", content: query }
    ],
  });

  return { content: chatCompletion.choices[0].message.content || 'No se pudo obtener una respuesta.' };
}

// Inicializamos la aplicación
document.addEventListener('DOMContentLoaded', initApp);

console.log('Script main.ts cargado');
