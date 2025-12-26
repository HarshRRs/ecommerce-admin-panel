import { Test, TestingModule } from '@nestjs/testing';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { HomepageSectionService } from './homepage-section.service';
import { NavigationMenuService } from './navigation-menu.service';

describe('CmsController', () => {
  let controller: CmsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CmsController],
      providers: [
        {
          provide: CmsService,
          useValue: {},
        },
        {
          provide: HomepageSectionService,
          useValue: {},
        },
        {
          provide: NavigationMenuService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CmsController>(CmsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
