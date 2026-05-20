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
} as const;
