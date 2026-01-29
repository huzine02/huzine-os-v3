import { AppData } from '../types';

const GITHUB_API = 'https://api.github.com/gists';
const FILENAME = 'huzine_os_data.json';

export const syncService = {
    async loadFromGist(token: string, gistId: string): Promise<AppData | null> {
        try {
            const res = await fetch(`${GITHUB_API}/${gistId}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!res.ok) throw new Error("Erreur chargement Gist");

            const json = await res.json();
            const file = json.files[FILENAME];
            
            if (!file || !file.content) throw new Error("Fichier introuvable dans le Gist");

            return JSON.parse(file.content) as AppData;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async saveToGist(token: string, gistId: string, data: AppData): Promise<boolean> {
        try {
            // Sécurité : On ne sauvegarde jamais la clé API Claude dans le JSON global stocké
            const cleanData = { ...data };
            
            const res = await fetch(`${GITHUB_API}/${gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    files: {
                        [FILENAME]: {
                            content: JSON.stringify(cleanData, null, 2)
                        }
                    }
                })
            });

            return res.ok;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
};