interface ProjectView {
  projectId: number;
  viewers: Set<string>; 
  totalViews: number;
}

const VIEW_STORAGE_KEY = 'pulsepool_project_views';

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

export function trackProjectView(projectId: number, walletAddress?: string): boolean {
  const viewerId = walletAddress?.toLowerCase() || 'anonymous';
  const viewsMap = getAllViews();
  
  let projectView = viewsMap.get(projectId);
  
  if (!projectView) {
    projectView = {
      projectId,
      viewers: new Set([viewerId]),
      totalViews: 1,
    };
    viewsMap.set(projectId, projectView);
    saveViews(viewsMap);
    return true;
  }
  
  if (projectView.viewers.has(viewerId)) {
    return false; 
  }
  
  projectView.viewers.add(viewerId);
  projectView.totalViews++;
  viewsMap.set(projectId, projectView);
  saveViews(viewsMap);
  
  return true;
}

export function getProjectViews(projectId: number): number {
  const viewsMap = getAllViews();
  const projectView = viewsMap.get(projectId);
  return projectView?.totalViews || 0;
}


export function getTrendingProjects(): Array<{ projectId: number; views: number }> {
  const viewsMap = getAllViews();
  const trending: Array<{ projectId: number; views: number }> = [];
  
  viewsMap.forEach((view, projectId) => {
    trending.push({ projectId, views: view.totalViews });
  });
  
  return trending.sort((a, b) => b.views - a.views);
}


export function hasUserViewedProject(projectId: number, walletAddress?: string): boolean {
  const viewerId = walletAddress?.toLowerCase() || 'anonymous';
  const viewsMap = getAllViews();
  const projectView = viewsMap.get(projectId);
  
  return projectView?.viewers.has(viewerId) || false;
}