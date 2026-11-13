import { CharacterAnimState } from '../../types/game';
import { CharacterController } from './CharacterController';
import { DualInteractionId, FacialExpression } from '../shared/CharacterTypes';

/**
 * CharacterInteractionManager
 * Coordinates scripted two-character scenes between Lulu and Nono without overlapping timers.
 */
export class CharacterInteractionManager {
  private timers: number[] = [];

  clearPending(): void {
    for (const id of this.timers) {
      window.clearTimeout(id);
    }
    this.timers = [];
  }

  private schedule(delayMs: number, fn: () => void): void {
    const id = window.setTimeout(fn, delayMs);
    this.timers.push(id);
  }

  runInteraction(
    interactionId: DualInteractionId,
    lulu: CharacterController,
    nono: CharacterController,
    onStepLabel?: (descriptionAr: string) => void
  ): void {
    this.clearPending();
    lulu.expressions.resetSpeechAndMouth();
    nono.expressions.resetSpeechAndMouth();

    // Note on Three.js Y-axis yaw when Lulu is at X=-0.62 and Nono is at X=+0.62:
    // +yaw turns front (+Z) toward +X (toward Nono); -yaw turns front (+Z) toward -X (toward Lulu).

    if (interactionId === 'luluWelcomesNono') {
      lulu.setFacingYaw(0.46);
      nono.setFacingYaw(-0.42);
      lulu.playAnimation(CharacterAnimState.Encourage, { loop: true });
      lulu.setExpression(FacialExpression.Encourage);
      lulu.speakTimed(1.8);
      nono.playAnimation(CharacterAnimState.Idle, { loop: true });
      nono.setExpression(FacialExpression.Smile);
      onStepLabel?.('لولو ترحب بصديقها نونو بحماس ودفء');
      this.schedule(850, () => {
        nono.playAnimation(CharacterAnimState.Clap, { loop: true });
        nono.setExpression(FacialExpression.Laugh);
      });
      return;
    }

    if (interactionId === 'nonoWavesToLulu') {
      lulu.setFacingYaw(0.42);
      nono.setFacingYaw(-0.48);
      nono.playAnimation(CharacterAnimState.Encourage, { loop: true });
      nono.setExpression(FacialExpression.Smile);
      lulu.playAnimation(CharacterAnimState.Idle, { loop: true });
      lulu.setExpression(FacialExpression.Smile);
      onStepLabel?.('نونو يلوّح بيده للولو بابتسامة مرحة');
      this.schedule(850, () => {
        lulu.playAnimation(CharacterAnimState.Laugh, { loop: false });
        onStepLabel?.('لولو ترد على تلويح نونو بضحكة لطيفة');
      });
      return;
    }

    if (interactionId === 'luluPointsToNono') {
      lulu.setFacingYaw(0.55);
      nono.setFacingYaw(-0.42);
      lulu.playAnimation(CharacterAnimState.Point, { loop: true });
      lulu.setExpression(FacialExpression.Encourage);
      nono.playAnimation(CharacterAnimState.Surprise, { loop: false });
      onStepLabel?.('لولو تشير إلى نونو ونونو يتفاجأ بلطف');
      this.schedule(1400, () => {
        nono.playAnimation(CharacterAnimState.Laugh, { loop: true });
      });
      return;
    }

    if (interactionId === 'nonoJumpsHappily') {
      lulu.setFacingYaw(0.4);
      nono.setFacingYaw(-0.22);
      nono.playAnimation(CharacterAnimState.Jump, { loop: false });
      lulu.playAnimation(CharacterAnimState.Clap, { loop: true });
      onStepLabel?.('نونو يقفز بسعادة ولولو تصفق له');
      this.schedule(1300, () => {
        nono.playAnimation(CharacterAnimState.Celebrate, { loop: true });
      });
      return;
    }

    if (interactionId === 'celebrateTogether') {
      lulu.setFacingYaw(0.16);
      nono.setFacingYaw(-0.16);
      lulu.playAnimation(CharacterAnimState.Celebrate, { loop: true });
      nono.playAnimation(CharacterAnimState.Dance, { loop: true });
      onStepLabel?.('لولو ونونو يحتفلان ويرقصان معاً بنجاح!');
      return;
    }

    if (interactionId === 'nonoSurprisedLuluLooks') {
      lulu.setFacingYaw(0.54);
      nono.setFacingYaw(-0.42);
      nono.playAnimation(CharacterAnimState.Surprise, { loop: false });
      lulu.playAnimation(CharacterAnimState.Think, { loop: false });
      onStepLabel?.('نونو يتفاجأ وتلتفت إليه لولو باهتمام وابتسامة');
      this.schedule(1150, () => {
        lulu.playAnimation(CharacterAnimState.Encourage, { loop: true });
        lulu.setExpression(FacialExpression.Smile);
        nono.playAnimation(CharacterAnimState.Idle, { loop: true });
        nono.setExpression(FacialExpression.Smile);
      });
      return;
    }

    if (interactionId === 'welcomeChild') {
      lulu.setFacingYaw(-0.08);
      nono.setFacingYaw(0.08);
      lulu.playAnimation(CharacterAnimState.Encourage, { loop: true });
      lulu.setExpression(FacialExpression.Encourage);
      lulu.speakTimed(2.2);
      nono.playAnimation(CharacterAnimState.Jump, { loop: false });
      onStepLabel?.('لولو ونونو يرحبان بالطفل في عالم المعرفة!');
      this.schedule(1350, () => {
        nono.playAnimation(CharacterAnimState.Clap, { loop: true });
        nono.setExpression(FacialExpression.Smile);
      });
      return;
    }

    if (interactionId === 'nonoClapsForLulu') {
      lulu.setFacingYaw(0.18);
      nono.setFacingYaw(-0.48);
      lulu.playAnimation(CharacterAnimState.Dance, { loop: true });
      nono.playAnimation(CharacterAnimState.Clap, { loop: true });
      onStepLabel?.('نونو يصفق بحماس بينما ترقص لولو بفرح');
      return;
    }

    // luluEncouragesNono
    lulu.setFacingYaw(0.5);
    nono.setFacingYaw(-0.46);
    nono.playAnimation(CharacterAnimState.GentleSad, { loop: true });
    lulu.playAnimation(CharacterAnimState.Encourage, { loop: true });
    lulu.setExpression(FacialExpression.Encourage);
    lulu.speakTimed(2.0);
    onStepLabel?.('لولو تشجع نونو بلطف ليعود إليه الحماس');
    this.schedule(1200, () => {
      nono.playAnimation(CharacterAnimState.Encourage, { loop: true });
      nono.setExpression(FacialExpression.Smile);
      onStepLabel?.('نونو يستعيد ابتسامته بتشجيع لولو!');
    });
  }

  dispose(): void {
    this.clearPending();
  }
}
