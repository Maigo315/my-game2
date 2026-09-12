(function(root){
  'use strict';
  // Author-confirmed operations. Callers must supply eligible events/sets;
  // this module does not invent encounter, recruitment, targeting or payment rules.
  const deltas={explosiveFist:{hits:1},swordDance:{hits:1},terraCrash:{critDamageMultiplier:.2},stardust:{power:.5},magicBarrier:{reduction:.1},dragonSpiral:{hits:1},nephilimLaser:{power:.3,shockRate:.15}};
  const pending=issues=>({status:'unconnected',issues});
  const api={
    mpReductionEligible:id=>!['supply','neoSupply'].includes(id),
    weaponSkill(base,{accessory=false,trait=false}={}){
      const result={...base},delta=deltas[base.id];
      if(delta) for(const [key,value] of Object.entries(delta)) result[key]=(base[key]??(key==='critDamageMultiplier'?1:0))+value*(Number(accessory)+Number(trait));
      return result;
    },
    battleTraitActive:({hp,front})=>hp>0&&front===true,
    autoSkillGate({conditions={},death=false,once=false,used=false}){
      if(once&&used)return {allowed:false,consume:false,reason:'used'};
      if(!death&&conditions.silence)return {allowed:false,consume:once,reason:'silence'};
      if(!death&&conditions.shock)return {allowed:false,consume:once?null:false,reason:'shock',issues:once?['U04','U07']:[]};
      return {allowed:true,consume:once,cost:0,requiresLearned:false,requiresWeapon:false};
    },
    async automaticSkill({actor,skill,death=false,onceKey=null,battle,execute}){
      const gate=api.autoSkillGate({conditions:actor.conditions,death,once:!!onceKey,used:!!battle?.used[onceKey]});
      if(gate.consume&&onceKey)battle.used[onceKey]=true;
      if(!gate.allowed)return gate;
      await execute(skill,{cost:0,requiresLearned:false,requiresWeapon:false});
      return gate;
    },
    newBattleState:()=>({used:{},damageBonus:0,counterCritBonus:0,cosmosBonus:0}),
    damageMultiplier:bonuses=>1+bonuses.reduce((a,b)=>a+b,0)/100,
    addRatePoints:(base,points)=>base+points,
    mistDragonEvasionBonus(hpRatio){
      const h=Math.max(0,Math.min(1,Number(hpRatio)||0));
      if(h>=.75)return 0;
      if(h<=.25)return 20;
      return Math.round((.75-h)*400)/10;
    },
    hellCost:(base,{otherMoth=false}={})=>base*3*(otherMoth?.8:1),
    hellHits:(resolve,rng)=>[resolve(rng()),resolve(rng())],
    criticalMultiplier:(personal,skill)=>personal*skill,
    ironOwlCritical:base=>base+.30,
    ancientLaserInput:({magic,magicBuff=1,concentration=1})=>Math.round(magic*magicBuff*concentration),
    atrachSpeed:(base,buff,{ownerIsActor=false}={})=>base*buff*(ownerIsActor?1:1.5),
    followup({action,success,additionalAttack=false,roll}){
      if(additionalAttack||action==='defend')return false;
      if(!success)return pending(['U14']);
      return ['attack','skill','item'].includes(action)?roll<.10:pending(['U14']);
    },
    generalStat:(base,n,buff=1,key='atk')=>['atk','def','magic','mdef','spd'].includes(key)?base*(1+.1*n)*buff:base,
    evilCriticalHit(battle,damage){const result=damage(api.damageMultiplier([battle.damageBonus]));battle.damageBonus=Math.min(30,battle.damageBonus+5);return result;},
    kaliCounterRate:base=>base+20,
    kaliCounterHit(battle,{hit}){if(hit)battle.counterCritBonus=Math.min(30,battle.counterCritBonus+5);return battle.counterCritBonus;},
    snowIceHit(actor,{damage,hp}){if(hp<=0)return {status:'not_applied',reason:'ko'};actor.spdBuff=1.5;actor.spdBuffRounds=4;return {status:'applied',damage:Math.max(0,Number(damage)||0)};},
    crimsonBuff:normal=>normal>1?normal+.5:normal,
    cosmosPaid(battle,paid){if(paid>0)battle.cosmosBonus=Math.min(15,battle.cosmosBonus+3);return battle.cosmosBonus;},
    eaterCrit(h){if(h>=.5)return 0;if(h>=.2)return Math.min(50,10*((.5-h)/.3)**2);if(h>=.05)return Math.min(50,10+40*((.2-h)/.15)**1.5);return 50;},
    sheepCrit:L=>Math.max(0,Math.min(15,(L-60)/4)),
    resolveWipe({eligibleUrd,stats=c=>c.stats,clock}){
      if(eligibleUrd){
        const battle=eligibleUrd._confirmedBattle||(eligibleUrd._confirmedBattle=api.newBattleState());
        if(!battle.used.urd){
          battle.used.urd=true;
          stats(eligibleUrd).hp=stats(eligibleUrd).hpMax;
          return {rescued:true,source:'urd',interruptEnemy:true};
        }
      }
      if(clock())return {rescued:true,source:'clock',interruptEnemy:true};
      return {rescued:false,defeat:true};
    },
    endRevival(kind,{dead=false,inReserve=false,roll=1,chance=.5}={}){
      if(kind==='ooparts') return {revive:!!dead&&!inReserve&&Number(roll)<Math.max(0,Math.min(1,Number(chance)||.5)),hp:1};
      if(kind==='phoenix') return {revive:!!dead&&!!inReserve,hp:1};
      return {revive:false,hp:0};
    },
    registration(draftId){
      const data=root.RPGConfirmedData,record=data?.records.find(c=>c.character_id===draftId);
      if(!record)throw Error('Unknown draft ID: '+draftId);
      return {record,runtimeId:data.idMap[draftId],image:'assets/characters/placeholder.svg',status:'runtime_registered_unrecruited',recruitment:pending(['U57','U58','U62']),trait:record.trait_runtime_status==='implemented'?{status:'implemented'}:pending(record.issue_ids),saveMigration:{status:'compatible',note:'未加入runtime登録のみ。既存セーブでは未加入のまま初期値を補完'}};
    },
    activateCompanion(draftId){const r=api.registration(draftId);throw Error(`${r.runtimeId}: 未接続 U57/U58/U62（加入・育成条件未確定）`);}
  };
  root.RPGConfirmedRules=Object.freeze(api);
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
