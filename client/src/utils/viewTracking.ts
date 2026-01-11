// Create this file: src/utils/viewTracking.ts

/**
 * View Tracking System using Wallet Address
 * Prevents duplicate views from same user
 * Syncs across devices using wallet address as identifier
 */

interface ProjectView {
  projectId: number;
  viewers: Set<string>; // Wallet addresses
  totalViews: number;
}

const VIEW_STORAGE_KEY = 'pulsepool_project_views';

/**
 * Get all project views from localStorage
 */
function getAllViews(): Map<number, ProjectView> {
  const stored = localStorage.getItem(VIEW_STORAGE_KEY);
  if (!stored) return new Map();
  
  try {
    const parsed = JSON.parse(stored);
    const viewsMap = new Map<number, ProjectView>();
    
    Object.keys(parsed).forEach(key => {
      const projectId = parseInt(key);
      viewsMap.set(projectId, {
        projectId,
        viewers: new Set(parsed[key].viewers),
        totalViews: parsed[key].totalViews,
      });
    });
    
    return viewsMap;
  } catch (error) {
    console.error('Failed to parse views:', error);
    return new Map();
  }
}

/**
 * Save views to localStorage
 */
function saveViews(viewsMap: Map<number, ProjectView>) {
  const obj: any = {};
  
  viewsMap.forEach((view, projectId) => {
    obj[projectId] = {
      viewers: Array.from(view.viewers),
      totalViews: view.totalViews,
    };
  });
  
  localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(obj));
}

/**
 * Track a project view
 * @param projectId - Project ID
 * @param walletAddress - User's wallet address (or 'anonymous' if not connected)
 * @returns true if this is a new view, false if duplicate
 */
export function trackProjectView(projectId: number, walletAddress?: string): boolean {
  const viewerId = walletAddress?.toLowerCase() || 'anonymous';
  const viewsMap = getAllViews();
  
  let projectView = viewsMap.get(projectId);
  
  if (!projectView) {
    // First view for this project
    projectView = {
      projectId,
      viewers: new Set([viewerId]),
      totalViews: 1,
    };
    viewsMap.set(projectId, projectView);
    saveViews(viewsMap);
    return true;
  }
  
  // Check if this viewer has already viewed
  if (projectView.viewers.has(viewerId)) {
    return false; // Duplicate view, don't count
  }
  
  // New unique viewer
  projectView.viewers.add(viewerId);
  projectView.totalViews++;
  viewsMap.set(projectId, projectView);
  saveViews(viewsMap);
  
  return true;
}

/**
 * Get view count for a project
 */
export function getProjectViews(projectId: number): number {
  const viewsMap = getAllViews();
  const projectView = viewsMap.get(projectId);
  return projectView?.totalViews || 0;
}

/**
 * Get all projects sorted by views (trending)
 */
export function getTrendingProjects(): Array<{ projectId: number; views: number }> {
  const viewsMap = getAllViews();
  const trending: Array<{ projectId: number; views: number }> = [];
  
  viewsMap.forEach((view, projectId) => {
    trending.push({ projectId, views: view.totalViews });
  });
  
  return trending.sort((a, b) => b.views - a.views);
}

/**
 * Check if current user has viewed a project
 */
export function hasUserViewedProject(projectId: number, walletAddress?: string): boolean {
  const viewerId = walletAddress?.toLowerCase() || 'anonymous';
  const viewsMap = getAllViews();
  const projectView = viewsMap.get(projectId);
  
  return projectView?.viewers.has(viewerId) || false;
}