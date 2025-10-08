/**
 * File system utilities
 */
export declare class FileUtils {
    static writeFile(filePath: string, content: string): Promise<void>;
    static readFile(filePath: string): Promise<string>;
    static validateTemplateFile(templateDir: string, templateName: string): Promise<string>;
    static ensureDirectoryExists(dirPath: string): Promise<void>;
}
//# sourceMappingURL=file-utils.d.ts.map