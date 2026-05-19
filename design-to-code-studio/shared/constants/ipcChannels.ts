export const IPC_CHANNELS = {
  design: {
    upload: 'design:upload',
    analyze: 'design:analyze',
  },
  codeGen: {
    generateJsx: 'design:generate-jsx',
    exportFiles: 'design:export-files',
  },
} as const;
