import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

function generateValidData(schema) {
  if (!schema) return null;

  // Handle basic Joi types
  if (schema.type === 'string') {
    if (schema.$_getRule('guid')) {
      return uuidv4();
    }
    if (schema.$_getRule('iso')) {
      return new Date().toISOString();
    }
    return 'sample string';
  }

  if (schema.type === 'number') {
    if (schema.$_getRule('integer')) {
      return 1;
    }
    return 1.0;
  }

  if (schema.type === 'boolean') {
    return true;
  }

  if (schema.type === 'date') {
    return new Date();
  }

  // Handle arrays
  if (schema.type === 'array') {
    const items = schema.$_terms.items?.[0];
    if (items) {
      return [generateValidData(items)];
    }
    return [];
  }

  // Handle objects
  if (schema.type === 'object') {
    const result = {};
    const children = schema.describe().keys;

    for (const [key, child] of Object.entries(children)) {
      const childSchema = schema.$_terms.keys.find(k => k.key === key)?.schema;
      if (childSchema) {
        result[key] = generateValidData(childSchema);
      }
    }
    return result;
  }

  // Handle alternatives
  if (schema.type === 'alternatives') {
    const matches = schema.$_terms.matches;
    if (matches && matches.length > 0) {
      return generateValidData(matches[0].schema);
    }
  }

  return null;
}

// Helper function to generate a valid object from the schema
const generateObject = schema => {
  try {
    const generatedData = generateValidData(schema);
    const { error, value } = schema.validate(generatedData);
    if (error) {
      throw new Error('Generated data validation failed: ' + error.details[0].message);
    }
    return value;
  } catch (error) {
    console.error('Error generating object:', error);
    return null;
  }
};

// Usage example with your schemas:
const generateValidSurvey = () => {
  const mockQuestion = generateObject(questionSchema);
  const mockForm = generateObject(formSchema);
  const mockSurvey = generateObject(surveySchema);

  return {
    question: mockQuestion,
    form: mockForm,
    survey: mockSurvey,
  };
};

export { generateObject, generateValidData, generateValidSurvey };
