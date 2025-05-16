import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    // Get Jira credentials from cookie
    const cookieStore = cookies();
    const jiraCookie = cookieStore.get('jira_credentials');
    
    if (!jiraCookie) {
      return NextResponse.json({ error: 'Jira authentication required' }, { status: 401 });
    }
    
    const { username, apiToken, domain } = JSON.parse(jiraCookie.value);
    const credentials = Buffer.from(`${username}:${apiToken}`).toString('base64');
    
    // Fetch boards first (to get board IDs)
    const boardsUrl = `https://${domain}.atlassian.net/rest/agile/1.0/board`;
    const boardsResponse = await fetch(boardsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json'
      }
    });
    
    if (!boardsResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch Jira boards',
        status: boardsResponse.status
      }, { status: boardsResponse.status });
    }
    
    const boardsData = await boardsResponse.json();
    
    if (!boardsData.values || boardsData.values.length === 0) {
      return NextResponse.json({ 
        error: 'No Jira boards found',
        boards: []
      });
    }
    
    // Fetch sprints for each board
    const boards = boardsData.values.slice(0, 5); // Limit to first 5 boards to avoid too many requests
    const sprintsPromises = boards.map(async (board: any) => {
      const sprintsUrl = `https://${domain}.atlassian.net/rest/agile/1.0/board/${board.id}/sprint?state=closed,active`;
      
      const sprintsResponse = await fetch(sprintsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/json'
        }
      });
      
      if (!sprintsResponse.ok) {
        console.warn(`Failed to fetch sprints for board ${board.id}`);
        return [];
      }
      
      const sprintsData = await sprintsResponse.json();
      
      return {
        boardId: board.id,
        boardName: board.name,
        sprints: sprintsData.values || []
      };
    });
    
    const boardsWithSprints = await Promise.all(sprintsPromises);
    
    // Flatten and transform the data
    const allSprints = boardsWithSprints.flatMap(board => 
      (board.sprints || []).map((sprint: any) => ({
        id: sprint.id,
        name: sprint.name,
        state: sprint.state,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        boardId: board.boardId,
        boardName: board.boardName,
        // Extract sprint number if available in the name (e.g., "Sprint 5")
        sprintNumber: (sprint.name.match(/sprint\s+(\d+)/i) || [])[1]
      }))
    );
    
    // Sort sprints by end date (descending)
    allSprints.sort((a, b) => 
      new Date(b.endDate || 0).getTime() - new Date(a.endDate || 0).getTime()
    );
    
    return NextResponse.json({ 
      sprints: allSprints.slice(0, 10) // Return the 10 most recent sprints
    });
    
  } catch (error) {
    console.error('Jira sprints error:', error);
    return NextResponse.json({ error: 'Failed to fetch sprints from Jira' }, { status: 500 });
  }
} 