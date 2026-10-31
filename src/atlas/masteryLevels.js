const levels={
 unassessed:{key:'unassessed',label:'Chưa đánh giá',confidence:'exploring'},
 low:{key:'low',label:'Rất yếu',confidence:'leaning'},
 weak:{key:'weak',label:'Yếu',confidence:'leaning'},
 developing:{key:'developing',label:'Đang phát triển',confidence:'committed'},
 strong:{key:'strong',label:'Vững',confidence:'core'},
};
// Classify the number users see; aggregation itself keeps full precision.
export function masteryLevel(score){const shown=score===null?null:Math.round(score);return shown===null?levels.unassessed:shown<40?levels.low:shown<60?levels.weak:shown<80?levels.developing:levels.strong;}
