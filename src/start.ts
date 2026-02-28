import { createStart } from "@tanstack/react-start";

import { observability } from "./middleware/observability";

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [observability],
  };
});
