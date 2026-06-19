import { Module } from '@nestjs/common';
import { DockIntelligenceClientService } from './dock-intelligence-client.service';

@Module({
  providers: [DockIntelligenceClientService],
  exports: [DockIntelligenceClientService],
})
export class DockIntelligenceClientModule {}
