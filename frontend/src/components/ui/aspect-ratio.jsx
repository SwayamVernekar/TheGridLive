// Naively converted from TypeScript — please review for correctness.
"use client";

import *"@radix-ui/react-aspect-ratio@1.1.2";

function AspectRatio({
  ...props
}) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
