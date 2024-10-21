import './style.css';
import { marked } from 'marked';
import OpenAI from 'openai';

// Definimos una interfaz para la respuesta de la API
interface ApiResponse {
  content: string;
}

// Función para inicializar la aplicación
function initApp() {
  const elements = {
    apiKeyDialog: document.getElementById('apiKeyDialog') as HTMLDialogElement | null,
    openApiKeyDialogBtn: document.getElementById('openApiKeyDialogBtn') as HTMLAnchorElement | null,
    saveApiKeyBtn: document.getElementById('saveApiKeyBtn') as HTMLButtonElement | null,
    apiKeyInput: document.getElementById('apiKeyInput') as HTMLInputElement | null,
    companySelect: document.getElementById('companySelect') as HTMLSelectElement | null,
    queryInput: document.getElementById('queryInput') as HTMLTextAreaElement | null,
    submitQueryBtn: document.getElementById('submitQueryBtn') as HTMLButtonElement | null,
    responseDisplay: document.getElementById('responseDisplay') as HTMLDivElement | null,
    themeToggleBtn: document.getElementById('themeToggleBtn') as HTMLButtonElement | null
  };

  const missingElements = Object.entries(elements)
    .filter(([_, element]) => element === null)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    console.error('No se pudieron encontrar los siguientes elementos en el DOM:', missingElements);
    return;
  }

  // Evento para abrir el diálogo de API Key
  elements.openApiKeyDialogBtn.addEventListener('click', () => {
    elements.apiKeyDialog.showModal();
  });

  // Evento para guardar la API Key
  elements.saveApiKeyBtn.addEventListener('click', () => {
    const apiKey = elements.apiKeyInput.value.trim();
    if (apiKey) {
      localStorage.setItem('openai_api_key', apiKey);
      elements.apiKeyDialog.close();
    } else {
      alert('Por favor, introduce una API Key válida.');
    }
  });

  // Evento para enviar una consulta
  elements.submitQueryBtn.addEventListener('click', async () => {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      alert('Por favor, configura tu API Key primero.');
      return;
    }

    const company = elements.companySelect.value;
    const query = elements.queryInput.value.trim();
    if (!query) {
      alert('Por favor, escribe una consulta.');
      return;
    }

    try {
      const response = await sendQuery(apiKey, company, query);
      const markedContent = await Promise.resolve(marked(response.content));
      elements.responseDisplay.innerHTML = markedContent;
    } catch (error) {
      console.error('Error al enviar la consulta:', error);
      elements.responseDisplay.textContent = 'Hubo un error al procesar tu consulta. Por favor, intenta de nuevo.';
    }
  });

  // Función para cambiar el tema
  elements.themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = elements.themeToggleBtn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-sun');
      icon.classList.toggle('fa-moon');
    }
  });

  // Comprobar el tema guardado al cargar la página
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
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
