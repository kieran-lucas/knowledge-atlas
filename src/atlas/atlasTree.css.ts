import {style} from '@vanilla-extract/css';
import {vars} from '../lifeweave/design-system/visual/contract.css';
// The only Tree extension: replace the selected leaf's state line with inline controls.
// Card, positioner, links, canvas and zoom styles remain the unmodified LifeWeave stylesheet.
export const inlineControls=style({position:'absolute',insetInlineStart:45,insetInlineEnd:9,insetBlockEnd:8,display:'flex',alignItems:'center',justifyContent:'space-between',gap:4,height:22,fontSize:10,fontWeight:720,color:vars.color.accentMuted});
export const scoreButton=style({minBlockSize:22,inlineSize:24,padding:0});
export const scoreValue=style({whiteSpace:'nowrap',fontVariantNumeric:'tabular-nums'});
export const edgeToEdgeWorkspace=style({gridTemplateRows:'minmax(0,1fr)',gap:0});
export const edgeToEdgeViewport=style({border:0,borderRadius:0,boxShadow:'none'});
