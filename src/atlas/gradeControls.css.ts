import {globalStyle,style} from '@vanilla-extract/css';
import {vars} from '../lifeweave/design-system/visual/contract.css';
import {duration,easing} from '../lifeweave/design-system/visual/motion.css';
const bands={
 low:{color:vars.color.danger,backgroundColor:vars.color.dangerSoft,borderColor:'#ECCDD0'},
 weak:{color:vars.color.warning,backgroundColor:vars.color.warningSoft,borderColor:'#EBDABC'},
 developing:{color:vars.color.accentMuted,backgroundColor:vars.color.accentSoft,borderColor:'#CBD9F7'},
 strong:{color:vars.color.success,backgroundColor:vars.color.successSoft,borderColor:'#C7E1D2'},
};
export const badge=style({selectors:Object.fromEntries(Object.entries(bands).map(([key,values])=>[`&[data-band="${key}"]`,values]))});
export const controls=style({display:'flex',alignItems:'center',justifyContent:'space-between',gap:6,width:'100%',height:24});
export const step=style({minBlockSize:24,inlineSize:26,flex:'0 0 26px',padding:0,selectors:{'&[aria-disabled="true"]':{opacity:.32,cursor:'default',transform:'none'}}});
export const value=style({position:'relative',minInlineSize:0,flex:1,display:'block',textAlign:'center',fontSize:11,lineHeight:'21px',fontWeight:650,whiteSpace:'nowrap',fontVariantNumeric:'tabular-nums',color:vars.color.textTertiary,selectors:Object.fromEntries(Object.entries(bands).map(([key,values])=>[`&[data-band="${key}"]`,{color:values.color}]))});
export const denominator=style({fontSize:9,fontWeight:500,opacity:.75});
export const unassessed=style({fontSize:9.5,fontWeight:550});
export const track=style({position:'absolute',insetInline:2,insetBlockEnd:0,height:1.5,borderRadius:vars.radius.full,background:vars.color.borderHairline,overflow:'hidden'});
globalStyle(`${track} i`,{display:'block',height:'100%',borderRadius:'inherit',background:'currentColor',transition:`width ${duration.state} ${easing.standard}`,'@media':{'(prefers-reduced-motion: reduce)':{transition:'none'}}});
globalStyle(`${value}[data-unassessed="true"] ${track}`,{background:'transparent',borderBottom:`1px dashed ${vars.color.borderStrong}`,borderRadius:0});
