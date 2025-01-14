import { mkdir, writeFile } from "fs/promises";

import openapi from "../openapi.json" assert { type: 'json' };

const targetDirectory = "src/lib/spotify/model";

async function generateSpotifyClient() {
  console.log("\nLaunched generate-spotify-client script");
  console.log('Generating Spotify client from OpenApi spec file...\n')
  await mkdir(targetDirectory, { recursive: true }); // Generate target directory

  const schemas = openapi.components.schemas;
  const typesToGenerate = Object.keys(schemas);

  for (const typeName of typesToGenerate) {
    const typeSchema = schemas[typeName];
    generateType(typeName, typeSchema);
  }
}

function generateType(typeName, typeSchema) {  
  console.log(`Generating type ${typeName}...`);

  const generatedCode = getGeneratedCode(typeName, typeSchema);

  writeFile(`${targetDirectory}/${typeName}.ts`, generatedCode);
}

function getGeneratedCode(typeName, typeSchema) {
  const generatedType = getGeneratedType(typeSchema);

  return `export type ${typeName} = ${generatedType};`;
}

function getGeneratedType(typeSchema) {
  const schemaType = typeSchema.type;

  switch (schemaType) {
    case "number": return "Number";
    case "integer": return "Number";
    case "string": return "String" ;
    case "boolean": return "Boolean";
    case "array": return "";
    case "object": {var type = '{\n';
    if (typeSchema.properties != undefined){ 
      for (const typeName of Object.keys(typeSchema.properties)) {
          type += `${typeName}`; 
          if (typeSchema.required != undefined){
            if (typeSchema.required.includes(typeName)){type += "";} 
            else{type += "?";}
            }
          else {type+="?";}
          type +=`: ${getGeneratedType(typeSchema.properties[typeName])};\n`;
        }
        
      }
    type +='}';
    return type;
    }
    default: return "";
  }
}

generateSpotifyClient();