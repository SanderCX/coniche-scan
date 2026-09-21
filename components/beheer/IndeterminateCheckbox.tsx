"use client";

import { useEffect, useRef } from "react";

export function IndeterminateCheckbox({
  indeterminate,
  ...props
}: { indeterminate: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return <input ref={ref} type="checkbox" {...props} />;
}
