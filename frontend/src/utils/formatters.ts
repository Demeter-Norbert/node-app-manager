export const formatPorts = (ports: any): string => {
  if (!ports || Object.keys(ports).length === 0) return "-";

  const bindings: string[] = [];
  for (const [internalPort, externalBinds] of Object.entries(ports)) {
    if (Array.isArray(externalBinds as any) && (externalBinds as any).length > 0) {
      const hostPort = (externalBinds as any)[0].HostPort;
      bindings.push(`${hostPort} - ${internalPort}`);
    } else {
      bindings.push(`${internalPort} (Internal)`);
    }
  }
  return bindings.join(", ");
};