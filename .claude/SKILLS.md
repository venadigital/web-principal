# Skills instaladas

Estas skills extienden a Claude Code en este proyecto. Se cargan automáticamente cuando Claude detecta que aplican a una tarea (por ejemplo, "revisa el UI" activa `web-design-guidelines` y `ui-refactor`).

## Procedencia

| Repositorio                                                                  | Skills aportadas                                                                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `ui-ux-pro-max`, `design`, `design-system`, `ui-styling`, `banner-design`, `brand`, `slides` |
| [LovroPodobnik/refactoring-ui-skill](https://github.com/LovroPodobnik/refactoring-ui-skill)     | `ui-refactor` + slash commands `/fix-colors`, `/fix-hierarchy`, `/fix-layout`, `/fix-typography`, `/ui-refactor` |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)      | `web-design-guidelines`, `react-best-practices`, `react-view-transitions`, `react-native-skills`, `composition-patterns`, `deploy-to-vercel`, `vercel-cli-with-tokens`, `vercel-optimize` |

## Atajos útiles para este proyecto

| Quiero...                                       | Skill / comando            |
| ----------------------------------------------- | -------------------------- |
| Auditar el sitio contra buenas prácticas web    | `web-design-guidelines`    |
| Mejorar jerarquía, tipografía o color del UI    | `ui-refactor` (o slash commands `/fix-*`) |
| Ajustar paleta, sistema de tokens, branding     | `design-system`, `brand`   |
| Diseñar nuevos banners / piezas sociales        | `banner-design`            |
| Optimizar React/Next si migras a un framework   | `react-best-practices`     |
| Animaciones con view transitions                | `react-view-transitions`   |

## Skills no relevantes en este momento

El sitio se despliega en **Hostinger con Node.js**, así que las skills `deploy-to-vercel`, `vercel-cli-with-tokens` y `vercel-optimize` no aplican al stack actual. Quedan instaladas por si migras a Vercel en el futuro — puedes borrarlas si quieres mantener el proyecto liviano:

```bash
rm -rf .claude/skills/deploy-to-vercel .claude/skills/vercel-cli-with-tokens .claude/skills/vercel-optimize
```

## Cómo usar una skill

Las skills no son "ejecutables" en sí mismas — Claude las descubre y aplica cuando detecta un patrón. Para forzar una skill, basta con mencionarla en tu prompt:

> "Usa la skill `ui-refactor` para revisar la sección de testimonios."

Los slash commands sí son invocables directamente:

```
/ui-refactor
/fix-colors
/fix-hierarchy
/fix-layout
/fix-typography
```
