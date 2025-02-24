import type { TemplateSection } from '../types/template.js';

export function baseTemplate(sections: TemplateSection[]): string {
  const xmlSections = sections.map(section => `
    <section name="${section.name}">
      <content>${section.content}</content>
    </section>
  `).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<template>
  ${xmlSections}
</template>`;
}

export const baseTemplateOld = (sections: TemplateSection): string => `
<TEMPLATE>
    <CODEBASE>
    ${sections.codebase}
    </CODEBASE>

    <TASK>
    ${sections.task}
    </TASK>

    <RULES>
    ${sections.rules}
    </RULES>

    <INSTRUCTIONS>
    ${sections.instructions}
    </INSTRUCTIONS>

    <PROMPT>
    ${sections.prompt}
    </PROMPT>
</TEMPLATE>`; 