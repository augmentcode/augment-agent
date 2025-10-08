/**
 * GitHub API types for PR information extraction
 */
export interface PullRequestInfo {
    number: number;
    title: string;
    body: string | null;
    state: string;
    user: {
        login: string;
    };
    head: {
        ref: string;
        sha: string;
        repo: {
            full_name: string;
            name: string;
            owner: {
                login: string;
            };
        };
    };
    base: {
        ref: string;
        sha: string;
        repo: {
            full_name: string;
            name: string;
            owner: {
                login: string;
            };
        };
    };
}
export interface PullRequestFile {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
}
export interface PullRequestDiff {
    content: string;
    size: number;
    truncated: boolean;
}
//# sourceMappingURL=github.d.ts.map