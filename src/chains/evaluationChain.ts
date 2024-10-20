import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const createEvaluationChain = (groq_api_key: string) => {
  const llm = new ChatGroq({
    apiKey: groq_api_key,
    model: "llama-3.1-8b-instant",
  });

  const template = `Revisa la compñaia que ha seleccionado el usuario y su pregunta y busca la respuesta en la documentación de la compañia`;

  const chatPrompt = ChatPromptTemplate.fromMessages<{ question: string; answer: string; format: string; difficulty: string; level: string }>([
    ["system", template],
    ["user", "Evalúa la respuesta a la pregunta: {question}\n\nRespuesta del estudiante: {answer}\n\nFormato de pregunta: {format}\n\nDificultad: {difficulty}\n\nNivel educativo: {level}"],
  ]);

  const parser = new StringOutputParser();

  return chatPrompt.pipe(llm).pipe(parser);
};