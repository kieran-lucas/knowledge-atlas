import originalTitles from './syllabus-original.json';
// The IDs and groups are the fixed curriculum supplied with the project brief.
const domains = [
 ['mechanics','Cơ học',[
  ['dynamics','Động lực học và động lượng',['I.1|Ba định luật Newton về chuyển động','I.2|Các định lý động lượng; định luật bảo toàn động lượng','I.7|Va chạm']],
  ['rigid','Cơ học vật rắn',['I.3|Chuyển động của vật rắn','I.4|Moment lực; moment quán tính','I.8|Động năng vật rắn','I.9|Moment động lượng; định luật bảo toàn moment động lượng']],
  ['energy','Công và năng lượng',['I.5|Thế năng, động năng','I.6|Định lý động năng; bảo toàn cơ năng']],
  ['gravity','Hấp dẫn',['I.10|Lực hấp dẫn và thế hấp dẫn','I.11|Chuyển động trong trường hấp dẫn']]]],
 ['waves','Dao động và sóng',[
  ['oscillation','Dao động',['II.1|Khái niệm về dao động, các đại lượng đặc trưng của dao động']],
  ['propagation','Sóng và sự truyền sóng',['II.2|Khái niệm về sóng, các đại lượng đặc trưng của sóng','II.3|Hiệu ứng Doppler']]]],
 ['thermal','Nhiệt học và vật lý thống kê',[
  ['ideal','Khí lý tưởng và thuyết động học',['III.1|Phương trình trạng thái khí lý tưởng','III.2|Phương trình cơ bản thuyết động học phân tử','III.6|Nội năng khí lý tưởng']],
  ['distribution','Phân bố thống kê phân tử',['III.3|Phân bố Maxwell','III.4|Tốc độ trung bình, tốc độ căn trung bình bình phương, tốc độ có xác suất cực đại','III.5|Phân bố Maxwell–Boltzmann']],
  ['laws','Các nguyên lý nhiệt động lực học',['IV.1|Định lý I nhiệt động lực học','IV.2|Định lý II nhiệt động lực học']],
  ['entropy','Entropy',['IV.3|Khái niệm entropy','IV.4|Biến thiên entropy của các quá trình khí lý tưởng và quá trình chuyển thể đơn giản']],
  ['cycles','Chu trình nhiệt',['IV.5|Chu trình Carnot; hiệu suất các chu trình']],
  ['realgas','Khí thực',['V.1|Phương trình Van der Waals','V.2|Nội năng khí thực; hiệu ứng Joule–Thomson']]]],
 ['electromagnetism','Điện từ học',[
  ['field','Điện trường và điện thế',['VI.1|Định luật Coulomb','VI.3|Điện trường, cường độ điện trường, điện thế']],
  ['gauss','Điện thông và định luật Gauss',['VI.2|Điện thông; điện cảm; định lý Ostrogradsky–Gauss đối với điện trường']],
  ['conductors','Vật dẫn trong điện trường',['VI.4|Trạng thái cân bằng tĩnh điện','VI.5|Hiện tượng điện hưởng']],
  ['capacitance','Điện dung và năng lượng',['VI.6|Điện dung vật dẫn, điện dung tụ điện','VI.7|Năng lượng điện trường']],
  ['magneticfield','Từ trường của dòng điện',['VII.1|Tương tác từ của dòng điện','VII.2|Từ trường, cảm ứng từ, từ thông']],
  ['magneticforce','Lực từ và chuyển động điện tích',['VII.3|Lực từ, hạt tích điện chuyển động trong từ trường, moment lực từ; công của lực từ']],
  ['magnetism','Từ tính vật chất',['VII.4|Sự từ hóa','VII.5|Chất thuận từ, nghịch từ, sắt từ']],
  ['induction','Hiện tượng cảm ứng điện từ',['VIII.1|Hiện tượng cảm ứng điện từ','VIII.2|Các định luật cảm ứng điện từ']],
  ['selfinduction','Tự cảm và năng lượng từ trường',['VIII.3|Hiện tượng tự cảm','VIII.4|Năng lượng từ trường']],
  ['emoscillation','Dao động điện từ',['IX.1|Dao động điện từ riêng','IX.2|Dao động điện từ tắt dần','IX.3|Dao động điện từ cưỡng bức và hiện tượng cộng hưởng']],
  ['maxwell','Maxwell và sóng điện từ',['IX.4|Các phương trình Maxwell, sóng điện từ','IX.5|Sự phát xạ các sóng điện từ; phổ điện từ']]]],
 ['optics','Quang học',[
  ['waveoptics','Quang học sóng',['X.1|Giao thoa ánh sáng','X.2|Nhiễu xạ Fresnel, nhiễu xạ một khe và phân bố cường độ trong nhiễu xạ một khe; nhiễu xạ tia X trên tinh thể','X.3|Nhiễu xạ nhiều khe; cách tử nhiễu xạ','X.4|Phân cực ánh sáng: hiện tượng, định luật Malus và độ phân cực','X.5|Laser và ứng dụng']],
  ['geometric','Quang hình học',[
   ['principles','Nguyên lý truyền ánh sáng',['GH.1|Mô hình tia sáng, truyền thẳng và quang trình','GH.2|Nguyên lý Fermat','GH.3|Định luật phản xạ','GH.4|Định luật khúc xạ Snell','GH.5|Phản xạ toàn phần','GH.6|Lăng kính và tán sắc']],
   ['imaging','Sự tạo ảnh',['GH.7|Ảnh qua gương phẳng','GH.8|Ảnh qua gương cầu','GH.9|Khúc xạ và tạo ảnh qua mặt phân cách cầu','GH.10|Thấu kính mỏng, công thức và dựng ảnh']],
   ['systems','Hệ quang học',['GH.11|Hệ nhiều thấu kính, độ phóng đại','GH.12|Dụng cụ quang: mắt, kính lúp, kính hiển vi, kính thiên văn']]]]]],
 ['modern','Vật lý hiện đại',[
  ['photon','Photon và quang điện',['XI.1|Thuyết lượng tử ánh sáng','XI.2|Hiệu ứng quang điện']],
  ['duality','Lưỡng tính sóng–hạt',['XI.3|Hiệu ứng Compton, nhiễu xạ electron','XI.5|Sóng de Broglie']],
  ['radiation','Bức xạ nhiệt',['XI.4|Bức xạ vật đen; định luật Stefan–Boltzmann; công thức Planck']],
  ['atomic','Cấu trúc nguyên tử',['XII.1|Mẫu Bohr của nguyên tử hydrogen','XII.2|Các trạng thái lượng tử của nguyên tử hydrogen','XII.3|Sự lượng tử hóa của moment động lượng và moment từ, hiệu ứng Zeeman thường']],
  ['nuclear','Vật lý hạt nhân',['XII.4|Năng lượng liên kết hạt nhân','XII.5|Hiện tượng phóng xạ','XII.6|Phản ứng hạt nhân']]]]
];

export const nodes = [{id:'spho', title:'SPhO', parent_id:null, nodeType:'root', sort_key:0}];
function append(parent, entries, type) {
 entries.forEach((entry, index) => {
  if (typeof entry === 'string') {
   const [code, title] = entry.split('|'); const official = !code.startsWith('GH.');
   nodes.push({id:(official?'spho.':'geo.')+code, title, originalTitle:official ? originalTitles[code] : title, displayTitle:title, parent_id:parent, nodeType:'leaf', syllabusItemId:code, officialSectionId:official?code.split('.')[0]:null, isOfficial:official, sort_key:index});
  } else {
   const [key,title,children] = entry; const id = type === 'domain' ? key : parent+'.'+key;
   nodes.push({id,title,displayTitle:title,parent_id:parent,nodeType:type,sort_key:index}); append(id,children,type==='domain'?'group':'subgroup');
  }
 });
}
append('spho', domains, 'domain');
export const leaves = nodes.filter(n => n.nodeType === 'leaf');
export const byId = new Map(nodes.map(n => [n.id,n]));
export const childrenOf = id => nodes.filter(n => n.parent_id === id);
export function descendants(id) { const children=childrenOf(id); return children.length ? children.flatMap(n=>descendants(n.id)) : [byId.get(id)]; }
