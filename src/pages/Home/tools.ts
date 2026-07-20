export type ToolCategory =
  | "encoding"
  | "media"
  | "text"
  | "utilities"
  | "games"
  | "design";

export interface Tool {
  href: string;
  title: string;
  desc?: string;
  meta: string;
  category: ToolCategory;
  hidden?: boolean;
}

export const CATEGORIES: { key: ToolCategory; label: string }[] = [
  { key: "media", label: "Media" },
  { key: "encoding", label: "Encoding" },
  { key: "text", label: "Text" },
  { key: "design", label: "Design" },
  { key: "utilities", label: "Utilities" },
  { key: "games", label: "Games & Cards" },
];

export const tools: Tool[] = [
  {
    href: "/base64/encode",
    title: "Base64 Encode",
    meta: "encode,base64,tool",
    category: "encoding",
  },
  {
    href: "/base64/decode",
    title: "Base64 Decode",
    meta: "decode,base64,tool",
    category: "encoding",
  },
  {
    href: "/qr-code",
    title: "QR Code Generator",
    meta: "qr,code,tool",
    category: "encoding",
  },
  {
    href: "/qr-code/scan",
    title: "QR Code Scanner",
    meta: "qr,code,scan,tool",
    category: "encoding",
  },
  {
    href: "/url/encode",
    title: "URL Encode",
    meta: "encode,url,tool",
    category: "encoding",
  },
  {
    href: "/url/decode",
    title: "URL Decode",
    meta: "decode,url,tool",
    category: "encoding",
  },
  {
    href: "/webp",
    title: "WebP Converter",
    meta: "webp,convert,tool",
    category: "media",
  },
  // {
  //   href: "/background-removal",
  //   title: "Background Removal",
  //   meta: "background,remove,ai,transparent,png,tool",
  //   category: "media",
  // },
  {
    href: "/color-background-removal",
    title: "Color Background Removal",
    meta: "color,background,remove,magic,wand,eraser,dropper,picker,transparent,png,tool",
    category: "media",
  },
  {
    href: "/textbin",
    title: "TextBin",
    meta: "text,bin,tool",
    category: "text",
  },
  {
    href: "/extra-line-removal",
    title: "Extra Line Removal",
    meta: "text,whitespace,lines,tool",
    category: "text",
  },
  {
    href: "/word-counter",
    title: "Word Counter",
    meta: "word,count,tool",
    category: "text",
  },
  {
    href: "/unzip",
    title: "Unzip Files",
    meta: "unzip,extract,zip,tool",
    category: "utilities",
  },
  {
    href: "/deck-draw-odds",
    title: "Deck Draw Odds",
    meta: "deck,cards,probability,odds,tool",
    category: "games",
  },
  {
    href: "/card-assumption",
    title: "Card Assumption",
    meta: "cards,probability,assumption,tool",
    category: "games",
  },
  {
    href: "/sim-code-converter",
    title: "Sim Code Converter",
    meta: "sim,code,convert,tool,one-piece-tcg,otcg",
    category: "utilities",
    hidden: true,
  },
  {
    href: "/deckbuilder-links",
    title: "Deckbuilder Links",
    meta: "deck,deckbuilder,links,egman,cardkaizoku,gumgum,tool,one-piece-tcg,otcg",
    category: "games",
    hidden: true,
  },
  {
    href: "/multi-deck-converter",
    title: "Multi-Deck Converter",
    meta: "deck,deckbuilder,links,convert,bulk,tool,one-piece-tcg,otcg",
    category: "games",
    hidden: true,
  },
  {
    href: "/deck-price",
    title: "Deck Price Calculator",
    meta: "deck,price,calculator,cost,money,value,tool,one-piece-tcg,otcg",
    category: "games",
    hidden: true,
  },
  {
    href: "/bracket-maker",
    title: "Bracket Maker",
    meta: "bracket,tournament,seeding,elimination,matchup,tool",
    category: "games",
  },
  {
    href: "/compare",
    title: "Text Compare",
    meta: "text,compare,diff,tool",
    category: "text",
  },
  {
    href: "/ev-charging",
    title: "EV Charging",
    meta: "ev,charging,tool",
    category: "utilities",
  },
  {
    href: "/opacifier",
    title: "Opacifier",
    meta: "color,opacity,alpha,hex,rgba,transparency,tool",
    category: "design",
  },
  {
    href: "/jwt",
    title: "JWT Debugger",
    meta: "jwt,json,web,token,decode,debug,auth,tool",
    category: "encoding",
  },
  {
    href: "/json",
    title: "JSON Formatter",
    meta: "json,format,pretty,minify,validate,lint,tool",
    category: "text",
  },
  {
    href: "/hash",
    title: "Hash Generator",
    meta: "hash,sha,sha1,sha256,sha512,checksum,digest,tool",
    category: "encoding",
  },
  {
    href: "/case-converter",
    title: "Case Converter",
    meta: "case,camel,snake,kebab,pascal,title,convert,tool",
    category: "text",
  },
  {
    href: "/html-entities/encode",
    title: "HTML Entity Encoder",
    meta: "html,entity,entities,escape,encode,tool",
    category: "encoding",
  },
  {
    href: "/html-entities/decode",
    title: "HTML Entity Decoder",
    meta: "html,entity,entities,unescape,decode,tool",
    category: "encoding",
  },
  {
    href: "/timestamp",
    title: "Unix Timestamp Converter",
    meta: "unix,timestamp,epoch,date,time,convert,iso,tool",
    category: "utilities",
  },
  {
    href: "/uuid",
    title: "UUID / ULID Generator",
    meta: "uuid,ulid,guid,id,generate,random,v4,v7,tool",
    category: "utilities",
  },
];
