import { GoogleGenAI, Type, FunctionDeclaration, Chat } from "@google/genai";
import { DOCTOR_NAME, ADDRESS } from "../constants";

// Helper to lazy-load the client.
// This ensures the app loads (GUI renders) even if the API Key isn't set yet.
// It will only error when you actually try to use the chat.
let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    // We provide a fallback string to ensure the constructor doesn't throw immediately 
    // if process.env.API_KEY is undefined during the initial load.
    const apiKey = process.env.API_KEY || ""; 
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

const bookingTool: FunctionDeclaration = {
  name: "bookAppointment",
  description: "Book a medical appointment. requires patient name, phone number, reason, and preferred slot.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      patientName: {
        type: Type.STRING,
        description: "The full name of the patient.",
      },
      phoneNumber: {
        type: Type.STRING,
        description: "The patient's phone number.",
      },
      reason: {
        type: Type.STRING,
        description: "Reason for the visit or symptoms.",
      },
      preferredSlot: {
        type: Type.STRING,
        description: "Preferred time slot (e.g., Morning, Evening).",
      },
    },
    required: ["patientName", "phoneNumber", "reason", "preferredSlot"],
  },
};

const SYSTEM_INSTRUCTION = `
You are the AI Health Assistant for ${DOCTOR_NAME}'s medical practice in Barrackpore, West Bengal.
Location: ${ADDRESS}.

Your Goal: Assist patients by answering questions about services, hours, and helping them book appointments.

Services: Emergency Care, Diabetes Management, Critical Care, Kidney Failure Management.

Booking Process:
To book an appointment, you MUST collect the following 4 pieces of information from the user:
1. Full Name
2. Phone Number
3. Reason for Visit
4. Preferred Time Slot

Ask for these details naturally. You can ask for them one by one or all at once.
Once you have ALL four details, call the "bookAppointment" tool.

After the tool runs successfully:
1. Confirm the appointment details to the user.
2. Provide the generated Booking ID.
3. Explicitly assure the user that a notification has been sent to Dr. Bhakat.
4. Confirm that their details have been automatically secured in the clinic's Notion database.

Emergency Protocol:
If the user describes symptoms of a life-threatening emergency (e.g., severe chest pain, trouble breathing, unconsciousness), DO NOT book an appointment. Immediately urge them to call the clinic's emergency line or go to the nearest hospital.
`;

export const createChatSession = (): Chat => {
  return getAiClient().chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: [bookingTool] }, { googleSearch: {} }]
    }
  });
};