import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { STORAGE_SERVICE } from '../storage/storage.types';
import { prismaServiceMock } from '../../test/mocks/prisma-service.mock';
import { EvidenceService } from './evidence.service';

describe('EvidenceService', () => {
  let service: EvidenceService;

  const storageServiceMock = {
    uploadEvidenceFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvidenceService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: STORAGE_SERVICE,
          useValue: storageServiceMock,
        },
      ],
    }).compile();

    service = module.get<EvidenceService>(EvidenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
