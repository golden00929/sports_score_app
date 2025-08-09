import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';

export class BracketController {
  // 브라켓 목록 조회
  static async getBrackets(req: AuthenticatedRequest, res: Response) {
    try {
      const { tournamentId } = req.params;

      const brackets = await prisma.bracket.findMany({
        where: { tournamentId },
        include: {
          matches: {
            orderBy: { matchNumber: 'asc' },
            include: {
              player1: true,
              player2: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: brackets,
      });
    } catch (error) {
      console.error('Get brackets error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '브라켓 목록 조회 중 오류가 발생했습니다.',
      });
    }
  }

  // 브라켓 생성
  static async createBracket(req: AuthenticatedRequest, res: Response) {
    try {
      const { tournamentId } = req.params;
      const { name, skillLevel, eventType, type, participantIds, teamCount, membersPerTeam, bracketSize } = req.body;
      
      console.log('Received bracket creation request:', {
        name, skillLevel, eventType, type, teamCount, membersPerTeam, bracketSize,
        participantIdsLength: participantIds?.length || 0
      });

      if (!name || !skillLevel || !eventType) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: '브라켓명, 등급, 경기종목을 입력해주세요.',
        });
      }

      // 참가자 정보 조회 - participantIds가 비어있으면 조건에 맞는 모든 참가자 조회
      let participants;
      if (!participantIds || participantIds.length === 0) {
        participants = await prisma.participant.findMany({
          where: {
            tournamentId,
            approvalStatus: 'approved',
            skillLevel,
            eventType,
          },
        });
      } else {
        participants = await prisma.participant.findMany({
          where: {
            tournamentId,
            id: { in: participantIds },
            approvalStatus: 'approved',
            skillLevel,
            eventType,
          },
        });
      }

      // 팀 수와 팀당 인원수 결정
      const finalTeamCount = teamCount || req.body.bracketSize || Math.max(Math.ceil(participants.length / (membersPerTeam || 1)), 4);
      const finalMembersPerTeam = membersPerTeam || (eventType?.includes('doubles') ? 2 : 1);
      const totalParticipants = finalTeamCount * finalMembersPerTeam;
      
      console.log('Bracket parameters:', {
        finalTeamCount,
        finalMembersPerTeam,
        totalParticipants,
        participantsLength: participants.length
      });
      
      // 브라켓 구조 생성 (팀 기반)
      const bracketData = BracketController.generateBracketStructure(
        participants, 
        type || 'single_elimination', 
        finalTeamCount,
        finalMembersPerTeam
      );
      
      console.log('Generated bracket data:', {
        type: bracketData.type,
        teamCount: bracketData.teamCount,
        matchesLength: bracketData.matches?.length || 0
      });

      // 브라켓 저장
      const bracket = await prisma.bracket.create({
        data: {
          tournamentId,
          name,
          skillLevel,
          eventType,
          type: type || 'single_elimination',
          participants: JSON.stringify(participants.map(p => p.id)),
          bracketData: JSON.stringify({
            ...bracketData,
            teamCount: finalTeamCount,
            membersPerTeam: finalMembersPerTeam,
            totalParticipants: totalParticipants
          }),
          status: 'draft',
        },
      });

      // 매치 생성
      const matches = await BracketController.createMatches(bracket.id, tournamentId, bracketData.matches);

      res.status(201).json({
        success: true,
        message: '브라켓이 성공적으로 생성되었습니다.',
        data: {
          bracket,
          matches,
        },
      });
    } catch (error) {
      console.error('Create bracket error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({
        error: 'Internal server error',
        message: '브라켓 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 브라켓 구조 자동 생성
  static generateBracketStructure(participants: any[], type: string, bracketSize?: number) {
    const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
    
    if (type === 'single_elimination') {
      return BracketController.generateSingleElimination(shuffledParticipants, bracketSize);
    } else if (type === 'round_robin') {
      return BracketController.generateRoundRobin(shuffledParticipants, bracketSize);
    }
    
    return BracketController.generateSingleElimination(shuffledParticipants, bracketSize);
  }

  // 단일 토너먼트 브라켓 생성
  static generateSingleElimination(participants: any[], bracketSize?: number) {
    const rounds: any[] = [];
    
    // 브라켓 크기 결정 (2의 거듭제곱으로 맞춤)
    const targetSize = bracketSize || participants.length;
    const actualBracketSize = Math.max(4, Math.pow(2, Math.ceil(Math.log2(targetSize))));
    
    // 빈 슬롯으로 브라켓 구성 (참가자가 있으면 앞쪽부터 배치)
    let currentRound = [];
    for (let i = 0; i < actualBracketSize; i++) {
      if (i < participants.length) {
        currentRound.push(participants[i]);
      } else {
        // 빈 슬롯 생성
        currentRound.push({
          id: `empty_slot_${i + 1}`,
          name: `빈 슬롯 ${i + 1}`,
          isEmpty: true
        });
      }
    }
    
    let roundNumber = 1;
    const matches: any[] = [];

    while (currentRound.length > 1) {
      const nextRound: any[] = [];
      const roundMatches: any[] = [];

      // 현재 라운드 매치 생성
      for (let i = 0; i < currentRound.length; i += 2) {
        const player1 = currentRound[i];
        const player2 = currentRound[i + 1] || null; // 홀수일 경우 부전승

        // 빈 슬롯 처리
        const isPlayer1Empty = player1?.isEmpty === true;
        const isPlayer2Empty = player2?.isEmpty === true;
        
        let matchStatus = 'scheduled';
        let winnerId = null;
        
        // 빈 슬롯이 있는 경우 처리
        if (isPlayer1Empty && isPlayer2Empty) {
          matchStatus = 'waiting'; // 두 슬롯 모두 비어있음
        } else if (isPlayer1Empty && !isPlayer2Empty) {
          matchStatus = 'completed';
          winnerId = player2?.id; // player2 부전승
        } else if (!isPlayer1Empty && isPlayer2Empty) {
          matchStatus = 'completed';
          winnerId = player1?.id; // player1 부전승
        } else if (!player2) {
          matchStatus = 'completed';
          winnerId = player1?.id; // 홀수 경우 부전승
        }

        const match = {
          id: `match_${roundNumber}_${Math.floor(i / 2) + 1}`,
          roundName: BracketController.getRoundName(roundNumber, Math.ceil(Math.log2(actualBracketSize))),
          matchNumber: Math.floor(i / 2) + 1,
          player1Id: isPlayer1Empty ? null : (player1?.id || null),
          player2Id: isPlayer2Empty ? null : (player2?.id || null),
          player1Name: isPlayer1Empty ? null : (player1?.name || null),
          player2Name: isPlayer2Empty ? null : (player2?.name || null),
          status: matchStatus,
          winnerId: winnerId,
          isEmpty: isPlayer1Empty && isPlayer2Empty,
        };

        roundMatches.push(match);
        matches.push(match);
        
        // 다음 라운드 진출자 결정
        if (matchStatus === 'completed' && winnerId) {
          // 승자가 있는 경우
          const winner = winnerId === player1?.id ? player1 : player2;
          nextRound.push(winner);
        } else if (matchStatus === 'waiting') {
          // 빈 슬롯 매치인 경우
          nextRound.push({
            id: `empty_next_${roundNumber}_${Math.floor(i / 2) + 1}`,
            name: `대기 중`,
            isEmpty: true
          });
        } else {
          // 일반 매치인 경우 (결과 대기)
          nextRound.push(null);
        }
      }

      rounds.push({
        roundNumber,
        roundName: BracketController.getRoundName(roundNumber, Math.ceil(Math.log2(actualBracketSize))),
        matches: roundMatches,
      });

      currentRound = nextRound;
      roundNumber++;
    }

    return {
      type: 'single_elimination',
      totalRounds: rounds.length,
      totalParticipants: participants.length,
      bracketSize: actualBracketSize,
      emptySlots: actualBracketSize - participants.length,
      rounds,
      matches,
    };
  }

  // 라운드로빈 브라켓 생성
  static generateRoundRobin(participants: any[], bracketSize?: number) {
    const matches: any[] = [];
    let matchNumber = 1;
    
    // 브라켓 크기 결정 (최소 4명)
    const targetSize = bracketSize || participants.length;
    const actualBracketSize = Math.max(4, targetSize);
    
    // 빈 슬롯으로 참가자 목록 확장
    const extendedParticipants = [...participants];
    for (let i = participants.length; i < actualBracketSize; i++) {
      extendedParticipants.push({
        id: `empty_slot_${i + 1}`,
        name: `빈 슬롯 ${i + 1}`,
        isEmpty: true
      });
    }

    // 참가자가 8명 이하면 단일 리그, 9명 이상이면 조별 리그로 처리
    if (actualBracketSize <= 8) {
      // 단일 리그전: 모든 참가자 간의 매치 생성
      for (let i = 0; i < extendedParticipants.length; i++) {
        for (let j = i + 1; j < extendedParticipants.length; j++) {
          const player1 = extendedParticipants[i];
          const player2 = extendedParticipants[j];
          
          // 빈 슬롯 처리
          const isPlayer1Empty = player1?.isEmpty === true;
          const isPlayer2Empty = player2?.isEmpty === true;
          
          let matchStatus = 'scheduled';
          let winnerId = null;
          
          if (isPlayer1Empty && isPlayer2Empty) {
            matchStatus = 'waiting'; // 두 슬롯 모두 비어있음
          } else if (isPlayer1Empty && !isPlayer2Empty) {
            matchStatus = 'completed';
            winnerId = player2?.id; // player2 부전승
          } else if (!isPlayer1Empty && isPlayer2Empty) {
            matchStatus = 'completed';
            winnerId = player1?.id; // player1 부전승
          }
          
          const match = {
            id: `rr_match_${matchNumber}`,
            roundName: '리그전',
            matchNumber: matchNumber++,
            player1Id: isPlayer1Empty ? null : player1.id,
            player2Id: isPlayer2Empty ? null : player2.id,
            player1Name: isPlayer1Empty ? null : player1.name,
            player2Name: isPlayer2Empty ? null : player2.name,
            status: matchStatus,
            winnerId: winnerId,
            isEmpty: isPlayer1Empty && isPlayer2Empty,
          };

          matches.push(match);
        }
      }
    } else {
      // 조별 리그전: 기본 4팀씩 조 편성
      const groupSize = 4;
      const numberOfGroups = Math.ceil(actualTeamCount / groupSize);
      
      for (let groupIndex = 0; groupIndex < numberOfGroups; groupIndex++) {
        const groupParticipants = extendedParticipants.slice(groupIndex * groupSize, (groupIndex + 1) * groupSize);
        const groupId = `group-${groupIndex + 1}`;
        const groupName = `${String.fromCharCode(65 + groupIndex)}조`;

        // 각 조 내에서 라운드로빈 매치 생성
        for (let i = 0; i < groupParticipants.length; i++) {
          for (let j = i + 1; j < groupParticipants.length; j++) {
            const player1 = groupParticipants[i];
            const player2 = groupParticipants[j];
            
            // 빈 슬롯 처리
            const isPlayer1Empty = player1?.isEmpty === true;
            const isPlayer2Empty = player2?.isEmpty === true;
            
            let matchStatus = 'scheduled';
            let winnerId = null;
            
            if (isPlayer1Empty && isPlayer2Empty) {
              matchStatus = 'waiting';
            } else if (isPlayer1Empty && !isPlayer2Empty) {
              matchStatus = 'completed';
              winnerId = player2?.id;
            } else if (!isPlayer1Empty && isPlayer2Empty) {
              matchStatus = 'completed';
              winnerId = player1?.id;
            }
            
            const match = {
              id: `${groupId}_match_${i}_${j}`,
              roundName: `${groupName} 리그전`,
              matchNumber: matchNumber++,
              player1Id: isPlayer1Empty ? null : player1.id,
              player2Id: isPlayer2Empty ? null : player2.id,
              player1Name: isPlayer1Empty ? null : player1.name,
              player2Name: isPlayer2Empty ? null : player2.name,
              status: matchStatus,
              winnerId: winnerId,
              groupId: groupId,
              isEmpty: isPlayer1Empty && isPlayer2Empty,
            };

            matches.push(match);
          }
        }
      }
    }

    return {
      type: 'round_robin',
      isGroupStage: actualBracketSize > 8,
      totalRounds: actualBracketSize > 8 ? Math.ceil(actualBracketSize / 4) : 1,
      totalParticipants: participants.length,
      bracketSize: actualBracketSize,
      emptySlots: actualBracketSize - participants.length,
      totalMatches: matches.length,
      matches,
    };
  }

  // 라운드명 생성
  static getRoundName(roundNumber: number, totalRounds: number): string {
    if (totalRounds === 1) return '결승';
    if (roundNumber === totalRounds) return '결승';
    if (roundNumber === totalRounds - 1) return '준결승';
    if (roundNumber === totalRounds - 2) return '8강';
    if (roundNumber === totalRounds - 3) return '16강';
    return `${roundNumber}회전`;
  }

  // 매치 데이터베이스 저장
  static async createMatches(bracketId: string, tournamentId: string, matches: any[]) {
    const matchData = matches.map(match => ({
      tournamentId,
      bracketId,
      roundName: match.roundName,
      matchNumber: match.matchNumber,
      player1Id: match.player1Id,
      player2Id: match.player2Id,
      player1Name: match.player1Name,
      player2Name: match.player2Name,
      status: match.status,
      winnerId: match.winnerId,
      player1Score: match.player1Score || 0,
      player2Score: match.player2Score || 0,
      notes: match.notes || null,
    }));

    return await prisma.match.createMany({
      data: matchData,
    });
  }

  // 브라켓 상태 업데이트 (draft -> published -> ongoing -> completed)
  static async updateBracketStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { bracketId } = req.params;
      const { status } = req.body;

      const validStatuses = ['draft', 'published', 'ongoing', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status',
          message: '유효하지 않은 상태입니다.',
        });
      }

      const bracket = await prisma.bracket.update({
        where: { id: bracketId },
        data: { status },
      });

      res.json({
        success: true,
        message: '브라켓 상태가 업데이트되었습니다.',
        data: bracket,
      });
    } catch (error) {
      console.error('Update bracket status error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '브라켓 상태 업데이트 중 오류가 발생했습니다.',
      });
    }
  }

  // 매치 결과 업데이트
  static async updateMatchResult(req: AuthenticatedRequest, res: Response) {
    try {
      const { matchId } = req.params;
      const { player1Score, player2Score, winnerId, notes } = req.body;

      if (player1Score == null || player2Score == null || !winnerId) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: '점수와 승자 정보를 입력해주세요.',
        });
      }

      // 매치 업데이트
      const match = await prisma.match.update({
        where: { id: matchId },
        data: {
          player1Score: parseInt(player1Score),
          player2Score: parseInt(player2Score),
          winnerId,
          status: 'completed',
          actualEndTime: new Date(),
          notes,
        },
        include: {
          bracket: true,
          player1: true,
          player2: true,
        },
      });

      // 다음 라운드 업데이트 (단일 토너먼트의 경우)
      if (match.bracket && match.bracket.type === 'single_elimination') {
        await BracketController.updateNextRoundMatch(match);
      }

      res.json({
        success: true,
        message: '매치 결과가 업데이트되었습니다.',
        data: match,
      });
    } catch (error) {
      console.error('Update match result error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '매치 결과 업데이트 중 오류가 발생했습니다.',
      });
    }
  }

  // 다음 라운드 매치 업데이트
  static async updateNextRoundMatch(completedMatch: any) {
    try {
      const bracketData = JSON.parse(completedMatch.bracket.bracketData);
      const currentRound = completedMatch.roundName;
      
      // 다음 라운드가 있는지 확인하고 업데이트
      // 이 부분은 브라켓 구조에 따라 복잡한 로직이 필요함
      // 현재는 기본적인 구현만 포함
      
      console.log(`Match ${completedMatch.id} completed, winner: ${completedMatch.winnerId}`);
    } catch (error) {
      console.error('Update next round error:', error);
    }
  }

  // 브라켓 매치 업데이트
  static async updateBracketMatches(req: AuthenticatedRequest, res: Response) {
    try {
      const { bracketId } = req.params;
      const { matches } = req.body;

      if (!matches || !Array.isArray(matches)) {
        return res.status(400).json({
          error: 'Invalid matches data',
          message: '유효하지 않은 매치 데이터입니다.',
        });
      }

      // 기존 매치들 삭제
      await prisma.match.deleteMany({
        where: { bracketId },
      });

      // 새로운 매치들 생성
      const matchData = matches.map(match => ({
        tournamentId: match.tournamentId || 'sample-tournament-id',
        bracketId,
        roundName: match.roundName,
        matchNumber: match.matchNumber,
        player1Id: match.player1Id || null,
        player2Id: match.player2Id || null,
        player1Name: match.player1Name || null,
        player2Name: match.player2Name || null,
        status: match.status || 'scheduled',
        winnerId: match.winnerId || null,
        player1Score: match.player1Score || 0,
        player2Score: match.player2Score || 0,
        notes: match.notes || null,
      }));

      await prisma.match.createMany({
        data: matchData,
      });

      // 업데이트된 브라켓 조회
      const updatedBracket = await prisma.bracket.findUnique({
        where: { id: bracketId },
        include: {
          matches: {
            orderBy: { matchNumber: 'asc' },
            include: {
              player1: true,
              player2: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: '브라켓 매치가 업데이트되었습니다.',
        data: updatedBracket,
      });
    } catch (error) {
      console.error('Update bracket matches error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '브라켓 매치 업데이트 중 오류가 발생했습니다.',
      });
    }
  }

  // 브라켓 삭제
  static async deleteBracket(req: AuthenticatedRequest, res: Response) {
    try {
      const { bracketId } = req.params;

      // 관련 매치들도 함께 삭제됨 (onDelete: Cascade)
      await prisma.bracket.delete({
        where: { id: bracketId },
      });

      res.json({
        success: true,
        message: '브라켓이 삭제되었습니다.',
      });
    } catch (error) {
      console.error('Delete bracket error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '브라켓 삭제 중 오류가 발생했습니다.',
      });
    }
  }

  // 참가자별 브라켓 추천
  static async getSuggestedBrackets(req: AuthenticatedRequest, res: Response) {
    try {
      const { tournamentId } = req.params;

      // 승인된 참가자 조회
      const participants = await prisma.participant.findMany({
        where: {
          tournamentId,
          approvalStatus: 'approved',
        },
      });

      // 경기종목과 등급별 그룹핑
      const groups = participants.reduce((acc: any, participant) => {
        const key = `${participant.eventType}_${participant.skillLevel}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(participant);
        return acc;
      }, {});

      // 브라켓 제안
      const suggestions = Object.entries(groups).map(([key, participants]: [string, any]) => {
        // eventType과 skillLevel 분리 (eventType에는 underscore가 포함될 수 있음)
        const lastUnderscoreIndex = key.lastIndexOf('_');
        const eventType = key.substring(0, lastUnderscoreIndex);
        const skillLevel = key.substring(lastUnderscoreIndex + 1);
        const count = participants.length;
        
        // 경기 종목별 한국어 이름 매핑
        const eventTypeNames: { [key: string]: string } = {
          'men_singles': '남자단식',
          'women_singles': '여자단식',
          'men_doubles': '남자복식',
          'women_doubles': '여자복식',
          'mixed_doubles': '혼성복식'
        };
        
        return {
          name: `${skillLevel}조 ${eventTypeNames[eventType] || eventType}`,
          skillLevel,
          eventType,
          participantCount: count,
          participants,
          recommendedType: count <= 8 ? 'single_elimination' : 'round_robin',
        };
      });

      res.json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      console.error('Get suggested brackets error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '브라켓 제안 조회 중 오류가 발생했습니다.',
      });
    }
  }
}