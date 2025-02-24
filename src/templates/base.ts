import { TemplateSection } from '../types/template.js';

export const baseTemplate = (sections: TemplateSection): string => `
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