const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const N3 = require('n3');

class StorageService {
    constructor() {
        this.dataRoot = process.env.DATA_ROOT || './data';
        this.storageRoot = path.join(this.dataRoot, 'storage');
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            await fs.ensureDir(this.dataRoot);
            await fs.ensureDir(this.storageRoot);

            console.log(`📁 Storage initialized at: ${this.storageRoot}`);
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize storage:', error);
            throw error;
        }
    }

    /**
     * Get the user's storage directory based on WebID
     */
    getUserStorageDir(webid) {
        const url = new URL(webid);
        const userPath = url.hostname + url.pathname.replace(/[^a-zA-Z0-9]/g, '_');
        return path.join(this.storageRoot, userPath);
    }

    /**
     * Get the user's credentials directory
     */
    getUserCredentialsDir(webid) {
        return path.join(this.getUserStorageDir(webid), 'credentials');
    }

    /**
     * Ensure user directories exist
     */
    async ensureUserDirectories(webid) {
        const userDir = this.getUserStorageDir(webid);
        const credentialsDir = this.getUserCredentialsDir(webid);

        await fs.ensureDir(userDir);
        await fs.ensureDir(credentialsDir);

        return { userDir, credentialsDir };
    }

    /**
     * Get file path for a specific resource
     */
    getResourcePath(webid, resourcePath) {
        const userDir = this.getUserStorageDir(webid);
        return path.join(userDir, resourcePath);
    }

    /**
     * Read a file and return its content
     */
    async readFile(filePath) {
        try {
            if (await fs.pathExists(filePath)) {
                return await fs.readFile(filePath, 'utf8');
            }
            return null;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    }

    /**
     * Write content to a file
     */
    async writeFile(filePath, content) {
        try {
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, content, 'utf8');
            return true;
        } catch (error) {
            console.error('Error writing file:', error);
            throw error;
        }
    }

    /**
     * Delete a file
     */
    async deleteFile(filePath) {
        try {
            if (await fs.pathExists(filePath)) {
                await fs.unlink(filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    /**
     * List files in a directory
     */
    async listDirectory(dirPath) {
        try {
            if (await fs.pathExists(dirPath)) {
                const files = await fs.readdir(dirPath);
                const fileStats = await Promise.all(
                    files.map(async (file) => {
                        const filePath = path.join(dirPath, file);
                        const stats = await fs.stat(filePath);
                        return {
                            name: file,
                            isDirectory: stats.isDirectory(),
                            size: stats.size,
                            modified: stats.mtime
                        };
                    })
                );
                return fileStats;
            }
            return [];
        } catch (error) {
            console.error('Error listing directory:', error);
            throw error;
        }
    }

    /**
     * Generate metadata for a resource
     */
    generateResourceMetadata(webid, resourceId, contentType, title = null) {
        const now = new Date().toISOString();
        const resourceUri = `<${resourceId}>`;

        return `@prefix dc: <http://purl.org/dc/terms/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix cred: <https://www.w3.org/2018/credentials#> .

${resourceUri} 
    rdf:type cred:VerifiableCredential ;
    dc:created "${now}"^^xsd:dateTime ;
    dc:modified "${now}"^^xsd:dateTime ;
    dc:creator <${webid}> ;
    ${title ? `dc:title "${title}" ;` : ''}
    dc:format "${contentType}" .
`;
    }

    /**
     * Update the credentials index file
     */
    async updateCredentialsIndex(webid) {
        try {
            const credentialsDir = this.getUserCredentialsDir(webid);
            const indexPath = path.join(credentialsDir, 'index.ttl');

            // List all credential files
            const files = await this.listDirectory(credentialsDir);
            const credentialFiles = files.filter(f =>
                !f.isDirectory &&
                f.name !== 'index.ttl' &&
                (f.name.endsWith('.ttl') || f.name.endsWith('.jsonld'))
            );

            // Generate index content
            let indexContent = `@prefix ldp: <http://www.w3.org/ns/ldp#> .
@prefix dc: <http://purl.org/dc/terms/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix cred: <https://www.w3.org/2018/credentials#> .

<./> a ldp:Container ;
     dc:title "Credentials Container" ;
     dc:created "${new Date().toISOString()}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .

`;

            credentialFiles.forEach(file => {
                indexContent += `<./> ldp:contains <./${file.name}> .\n`;
            });

            await this.writeFile(indexPath, indexContent);
            return indexPath;
        } catch (error) {
            console.error('Error updating credentials index:', error);
            throw error;
        }
    }

    /**
     * Convert JSON-LD to Turtle
     */
    async jsonLdToTurtle(jsonLd) {
        try {
            const parser = new N3.Parser();
            const writer = new N3.Writer();

            return new Promise((resolve, reject) => {
                parser.parse(JSON.stringify(jsonLd), (error, quad, prefixes) => {
                    if (error) {
                        reject(error);
                    } else if (quad) {
                        writer.addQuad(quad);
                    } else {
                        writer.end((error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        });
                    }
                });
            });
        } catch (error) {
            console.error('Error converting JSON-LD to Turtle:', error);
            throw error;
        }
    }

    /**
     * Convert Turtle to JSON-LD (simplified)
     */
    async turtleToJsonLd(turtle) {
        try {
            const parser = new N3.Parser();
            const quads = parser.parse(turtle);

            // This is a simplified conversion
            // In production, use a proper RDF to JSON-LD converter
            const jsonLd = {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://schema.org/"
                ]
            };

            // Extract basic properties from quads
            quads.forEach(quad => {
                if (quad.predicate.id === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
                    jsonLd.type = quad.object.id.split('#').pop() || quad.object.id.split('/').pop();
                }
            });

            return jsonLd;
        } catch (error) {
            console.error('Error converting Turtle to JSON-LD:', error);
            throw error;
        }
    }
}

const storageService = new StorageService();
module.exports = storageService;
