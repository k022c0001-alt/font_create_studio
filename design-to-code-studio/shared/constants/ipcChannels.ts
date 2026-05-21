export const IPC_CHANNELS = {
  design: {
    upload: 'design:upload',
    analyze: 'design:analyze',
  },
  codeGen: {
    generateJsx: 'design:generate-jsx',
    exportFiles: 'design:export-files',
  },
  projects: {
    list: 'projects:list',
    get: 'projects:get',
    create: 'projects:create',
    update: 'projects:update',
    delete: 'projects:delete',
  },
  font: {
    list: 'font:list',
    generate: 'font:generate',
    convert: 'font:convert',
    subset: 'font:subset',
    delete: 'font:delete',
  },
  ai: {
    chat: 'ai:chat',
    chatStream: 'ai:chat-stream',
    generate: 'ai:generate',
  },
  export: {
    zip: 'export:zip',
    preview: 'export:preview',
  },
} as const;
