import { z } from "zod";

/**
 * Minimal Zod → JSON Schema converter sufficient for MCP tool inputSchema.
 * Supports: ZodObject, ZodString, ZodNumber, ZodBoolean, ZodArray, ZodEnum,
 * ZodOptional, ZodDefault. Defers to z's openapi-style metadata via _def.
 *
 * We deliberately keep this small to avoid a heavyweight dep; if we need
 * more, add `zod-to-json-schema` package.
 */
export function zodToJsonSchema(schema: z.ZodTypeAny): object {
  return toSchema(schema);
}

function toSchema(s: z.ZodTypeAny): object {
  const def = s._def as { typeName: string };
  switch (def.typeName) {
    case "ZodObject": {
      const obj = s as z.ZodObject<z.ZodRawShape>;
      const properties: Record<string, object> = {};
      const required: string[] = [];
      const shape = obj.shape;
      for (const key of Object.keys(shape)) {
        const child = shape[key]!;
        properties[key] = toSchema(child);
        if (!isOptional(child)) required.push(key);
      }
      return {
        type: "object",
        properties,
        required,
        additionalProperties: false,
      };
    }
    case "ZodString": {
      const s2 = s as z.ZodString;
      const out: Record<string, unknown> = { type: "string" };
      const checks = (s2._def as { checks?: { kind: string; value?: number }[] }).checks ?? [];
      for (const c of checks) {
        if (c.kind === "min" && c.value !== undefined) out["minLength"] = c.value;
        if (c.kind === "max" && c.value !== undefined) out["maxLength"] = c.value;
      }
      return out;
    }
    case "ZodNumber": {
      const s2 = s as z.ZodNumber;
      const out: Record<string, unknown> = { type: "number" };
      const checks = (s2._def as { checks?: { kind: string; value?: number; inclusive?: boolean }[] }).checks ?? [];
      for (const c of checks) {
        if (c.kind === "min" && c.value !== undefined) out["minimum"] = c.value;
        if (c.kind === "max" && c.value !== undefined) out["maximum"] = c.value;
        if (c.kind === "int") out["type"] = "integer";
      }
      return out;
    }
    case "ZodBoolean":
      return { type: "boolean" };
    case "ZodEnum": {
      const e = s as z.ZodEnum<[string, ...string[]]>;
      return { type: "string", enum: [...e.options] };
    }
    case "ZodArray": {
      const inner = (s._def as { type: z.ZodTypeAny }).type;
      return { type: "array", items: toSchema(inner) };
    }
    case "ZodOptional": {
      const inner = (s._def as { innerType: z.ZodTypeAny }).innerType;
      return toSchema(inner);
    }
    case "ZodDefault": {
      const inner = (s._def as { innerType: z.ZodTypeAny }).innerType;
      const out = toSchema(inner);
      const defaultValue = (s._def as { defaultValue: () => unknown }).defaultValue();
      return { ...out, default: defaultValue };
    }
    case "ZodLiteral": {
      const v = (s._def as { value: unknown }).value;
      return { const: v };
    }
    case "ZodRecord":
      return { type: "object", additionalProperties: true };
    default:
      return {};
  }
}

function isOptional(s: z.ZodTypeAny): boolean {
  const t = (s._def as { typeName: string }).typeName;
  return t === "ZodOptional" || t === "ZodDefault";
}
