# 14 — Đối chiếu đầy đủ với BPMN

Phụ lục trích xuất từ XML gốc. Nhãn giữ tiếng Anh; dấu `/` trong nhãn thay cho xuống dòng. Cột module là cách phân nhóm **[Đề xuất]** của bộ tài liệu; Notify được gom về M10 dù nằm trong luồng của module khác. M01 không có task riêng trong nguồn.

## 1. Cấu trúc và kiểm tra tham chiếu

- Pool: `OVERALL RATING PROCESS OF PMS`; process: `Process_1`, `isExecutable=false`.
- 84 flow node: 57 task, 25 exclusive gateway, 1 start event, 1 end event; 96 sequence flow.
- 4 lane, 2 data store reference, 2 data input association, 16 text annotation và 16 association nối annotation (12 ở collaboration, 4 ở process).
- Đã kiểm tra: mọi source/target của sequence flow tồn tại; toàn bộ 84 flow node đều đi tới được từ START và đều có đường tới END nếu chọn các nhánh thích hợp.
- Đây là kiểm tra cấu trúc đồ thị; không chứng minh quy trình chắc chắn kết thúc khi người dùng lặp feedback/normalization, không thay thế kiểm định BPMN schema hoặc chạy workflow engine.
- Không có conditionExpression hay default flow. Không có serviceTask/userTask riêng; automation được mô tả bằng annotation.

## 2. Lane

| Lane ID | Tên | Số flow node |
|---|---|---|
| `Lane_1r13w78` | L1 MANAGER | 25 |
| `Lane_136x18r` | EMPLOYEE | 22 |
| `Lane_05v2m7u` | CAMPUS HR / HRBP | 14 |
| `Lane_0pe9scw` | CORPORATE HR / HRBP | 23 |

## 3. Toàn bộ task (57)

| ID | Nhãn gốc | Lane | Module | Annotation |
|---|---|---|---|---|
| `Activity_0yliwah` | View Default Global Rubric | CORPORATE HR / HRBP | M03 | — |
| `Activity_0180jgy` | Customize Rubric's / Score Range or Description for Each KPI | CORPORATE HR / HRBP | M03 | — |
| `Activity_1uakphc` | View Customized Rubric | CORPORATE HR / HRBP | M03 | — |
| `Activity_1vyds18` | Publish Library for Campus Level | CORPORATE HR / HRBP | M03 | — |
| `Activity_0bnucj2` | Create / Designation Based / Template Library | CORPORATE HR / HRBP | M03 | — |
| `Activity_0spq6mc` | Create/Clone new Appraisal Cycle | CAMPUS HR / HRBP | M04 | — |
| `Activity_11j692f` | View Employee's Self Rating | L1 MANAGER | M06 | — |
| `Activity_1cki94k` | Comment on each Employee's Self Rating KRA or KPI | L1 MANAGER | M06 | — |
| `Activity_1ddd548` | Notify / to Employee | L1 MANAGER | M10 | Service / / Automation Task |
| `Activity_02vft5k` | Select Current Appraisal Cycle | EMPLOYEE | M05 | — |
| `Activity_08ley76` | View Assigned Goal | EMPLOYEE | M05 | — |
| `Activity_022rxwr` | View Rubric for each KPI | EMPLOYEE | M05 | — |
| `Activity_1ph24ox` | Conduct / Self-rating | EMPLOYEE | M06 | Mid-Year Review |
| `Activity_1gqvi4y` | Submit Goal | EMPLOYEE | M05 | — |
| `Activity_1uie3ec` | Submit / Self-Rating | EMPLOYEE | M06 | — |
| `Activity_17dnswf` | Review Manager's Feedback/ Respond | EMPLOYEE | M06 | — |
| `Activity_1rtms55` | Notify / to Manager | EMPLOYEE | M10 | Service / / Automation Task |
| `Activity_1i3marn` | Respond Manager's Feedback | EMPLOYEE | M06 | — |
| `Activity_1o42ms8` | Notify / to Manager | EMPLOYEE | M10 | — |
| `Activity_16p384u` | Rate Employee Goal | L1 MANAGER | M06 | Mid-Year Review |
| `Activity_0ygdxgj` | Submit Manager Rating | L1 MANAGER | M06 | — |
| `Activity_1arvgb4` | Notify / to Employee | L1 MANAGER | M10 | Service / / Automation Task |
| `Activity_0o834q6` | View Manager Rating | EMPLOYEE | M06 | — |
| `Activity_1jwk2on` | Conduct / Self-rating | EMPLOYEE | M07 | Year-End Review |
| `Activity_03j1p16` | Submit / Self-Rating | EMPLOYEE | M07 | — |
| `Activity_17fp1mz` | View Employee's Self Rating | L1 MANAGER | M07 | — |
| `Activity_0kcts77` | Provide feedback on Employee's Self Rating | L1 MANAGER | M07 | — |
| `Activity_11ejbvg` | Review Employee's Feedback/ Respond | L1 MANAGER | M06 | — |
| `Activity_0sk989p` | Respond Employee's Feedback | L1 MANAGER | M06 | — |
| `Activity_1sgv8ot` | Notify / to Employee | L1 MANAGER | M10 | Service / / Automation Task |
| `Activity_0lszlxa` | Notify to Manager | EMPLOYEE | M10 | Service / / Automation Task |
| `Activity_0zactp8` | Notify Respond to Manager | EMPLOYEE | M10 | Service / / Automation Task |
| `Activity_19hm5an` | Comment on each Manager's Rating KRA or KPI | EMPLOYEE | M06 | — |
| `Activity_0pwn5b8` | View Published Designation Based Template Library | CAMPUS HR / HRBP | M04 | — |
| `Activity_1cnlevt` | Configure Template Library or its Rubric | CAMPUS HR / HRBP | M04 | — |
| `Activity_12z6lsy` | Send for Approval | CAMPUS HR / HRBP | M04 | — |
| `Activity_0kqtll8` | Apply Template Library to Employee | CAMPUS HR / HRBP | M05 | — |
| `Activity_1pw9aqx` | Automatically Assign Goal | CAMPUS HR / HRBP | M05 | Service / / Automation Task |
| `Activity_0s4afhd` | Notify Employee | CAMPUS HR / HRBP | M10 | Service / / Automation Task |
| `Activity_12w0foa` | Manually Re-Assign Goal | CAMPUS HR / HRBP | M05 | — |
| `Activity_1h1vl8p` | Notify Corporate HR | CAMPUS HR / HRBP | M10 | Service / / Automation Task |
| `Activity_0o42453` | Approve Change Request | CORPORATE HR / HRBP | M04 | — |
| `Activity_0lbbssq` | Reject Change Request | CORPORATE HR / HRBP | M04 | — |
| `Activity_0ncf5yw` | Create KPI parameter library / (KRA - KPI) | CORPORATE HR / HRBP | M02 | — |
| `Activity_0z3r871` | Rate Employee Goal | L1 MANAGER | M07 | Year-End Review |
| `Activity_098w8bk` | Input Achievement | L1 MANAGER | M07 | — |
| `Activity_0nibfz6` | Submit Manager Rating | L1 MANAGER | M07 | — |
| `Activity_1eai38x` | Calculate Score pre Normalization | L1 MANAGER | M08 | Service / / Automation Task |
| `Activity_1bi5h1k` | Notify Corp HR to start Normalization | L1 MANAGER | M10 | Service / / Automation Task |
| `Activity_1egz21e` | Rate score based on associated Rubric | L1 MANAGER | M07 | — |
| `Activity_0rq72q6` | Review Rating Score Pre Normalization | CORPORATE HR / HRBP | M09 | — |
| `Activity_07nnoe1` | Re-Calculate Rating Score | CORPORATE HR / HRBP | M09 | Service / / Automation Task |
| `Activity_03djxoo` | Review / Re-Calculated Rating Score | CORPORATE HR / HRBP | M09 | — |
| `Activity_0t9khwd` | Scale Up Rating Score | CORPORATE HR / HRBP | M09 | — |
| `Activity_12c5mcr` | Scale Down Rating Score | CORPORATE HR / HRBP | M09 | — |
| `Activity_11mn5uh` | Publish Final Rating Score & Feedback for Employee | CORPORATE HR / HRBP | M09 | — |
| `Activity_10drbxx` | View Final Rating Score & Feedback on Individual Rating | EMPLOYEE | M09 | — |

## 4. Toàn bộ gateway (25)

Các gateway không tên thường gộp các nhánh thay thế hoặc nhận đường quay lại. Tất cả đều là exclusive gateway, không phải điểm chờ đồng bộ nhiều token.

| ID | Nhãn | Module | Số vào / ra |
|---|---|---|---|
| `Gateway_0ruqb61` | Check Template Rubric | M03 | 1 / 2 |
| `Gateway_01fnm8s` | (không có nhãn) | M03 | 2 / 1 |
| `Gateway_0rhpfn7` | Merge to start the master data creation process again | M03 | 2 / 1 |
| `Gateway_0krqumi` | Feedback / / Respond ? | M06 | 1 / 2 |
| `Gateway_1s5hl5u` | (không có nhãn) | M06 | 2 / 1 |
| `Gateway_0c6iud2` | [Self Rating] / Merge to start the feedback process again | M06 | 2 / 1 |
| `Gateway_04zimsb` | Feedback / / Respond ? | M06 | 1 / 2 |
| `Gateway_1fg1yqp` | Respond / Feedback ? | M06 | 1 / 2 |
| `Gateway_1adm9if` | (không có nhãn) | M06 | 2 / 1 |
| `Gateway_0dwkatr` | Feedback ? | M07 | 1 / 2 |
| `Gateway_0ucdgtr` | (không có nhãn) | M07 | 2 / 1 |
| `Gateway_0prtaec` | [Individual Rating] / Merge to start the / feedback process again | M06 | 2 / 1 |
| `Gateway_1v42x5g` | Feedback / / Respond ? | M06 | 1 / 2 |
| `Gateway_0taoydb` | Corp HR approve change request ? | M04 | 1 / 2 |
| `Gateway_1hvw1m1` | Merge to review the Role Based template library again / (rejected template included) | M04 | 2 / 1 |
| `Gateway_03zwpjs` | Local Configuration required ? / OR changes required upon rejection ? | M04 | 1 / 2 |
| `Gateway_145c4si` | (không có nhãn) | M04 | 2 / 1 |
| `Gateway_1pl3rx2` | (không có nhãn) | M05 | 2 / 1 |
| `Gateway_1w2g6kz` | Check Assigned Goal | M05 | 1 / 3 |
| `Gateway_07t4291` | Rating Data ? | M07 | 1 / 2 |
| `Gateway_1yo2ofi` | (không có nhãn) | M07 | 2 / 1 |
| `Gateway_0a55y07` | Normalize Rating Score Option | M09 | 1 / 2 |
| `Gateway_0rlzxfl` | (không có nhãn) | M09 | 2 / 1 |
| `Gateway_04u7w77` | Merge to Normalize again | M09 | 2 / 1 |
| `Gateway_1crydfc` | Satisfied ? | M09 | 1 / 2 |

## 5. Toàn bộ sequence flow (96)

Nhãn `—` nghĩa là flow không có name trong XML. Khi tài liệu mô tả approve/reject, scale up/down hoặc hài lòng/chưa hài lòng cho flow không nhãn, đó là cách đọc theo task đích hoặc mô tả đường lặp.

| Flow ID | Từ | Đến | Nhãn nhánh |
|---|---|---|---|
| `Flow_1mtuzwi` | Create / Designation Based / Template Library (`Activity_0bnucj2`) | Check Template Rubric (`Gateway_0ruqb61`) | — |
| `Flow_13w35nq` | Check Template Rubric (`Gateway_0ruqb61`) | Customize Rubric's / Score Range or Description for Each KPI (`Activity_0180jgy`) | Required Range Configuration OR Description Configuration for each Range |
| `Flow_1k8yf1a` | Check Template Rubric (`Gateway_0ruqb61`) | View Default Global Rubric (`Activity_0yliwah`) | No Rubric Configuration Required |
| `Flow_01e7lrr` | View Default Global Rubric (`Activity_0yliwah`) | (không có nhãn) (`Gateway_01fnm8s`) | — |
| `Flow_1fzr1th` | Customize Rubric's / Score Range or Description for Each KPI (`Activity_0180jgy`) | View Customized Rubric (`Activity_1uakphc`) | — |
| `Flow_0qhkcdf` | View Customized Rubric (`Activity_1uakphc`) | (không có nhãn) (`Gateway_01fnm8s`) | — |
| `Flow_1ohajk2` | (không có nhãn) (`Gateway_01fnm8s`) | Publish Library for Campus Level (`Activity_1vyds18`) | — |
| `Flow_0x7tret` | Publish Library for Campus Level (`Activity_1vyds18`) | Create/Clone new Appraisal Cycle (`Activity_0spq6mc`) | — |
| `Flow_0sjg9eq` | START (`Event_1ooxcox`) | Merge to start the master data creation process again (`Gateway_0rhpfn7`) | — |
| `Flow_067dxua` | Notify Corporate HR (`Activity_1h1vl8p`) | Merge to start the master data creation process again (`Gateway_0rhpfn7`) | [LOOP BACK] / 1. Corporate HR need to add unmapped Designation(s) to the respective Designation Based Template to ensure full employee rating goal coverage |
| `Flow_0x0gvkb` | Merge to start the master data creation process again (`Gateway_0rhpfn7`) | Create KPI parameter library / (KRA - KPI) (`Activity_0ncf5yw`) | — |
| `Flow_05v2ul4` | Create KPI parameter library / (KRA - KPI) (`Activity_0ncf5yw`) | Create / Designation Based / Template Library (`Activity_0bnucj2`) | — |
| `Flow_1w57s49` | Create/Clone new Appraisal Cycle (`Activity_0spq6mc`) | Merge to review the Role Based template library again / (rejected template included) (`Gateway_1hvw1m1`) | — |
| `Flow_05dxvo7` | [Self Rating] / Merge to start the feedback process again (`Gateway_0c6iud2`) | View Employee's Self Rating (`Activity_11j692f`) | — |
| `Flow_17egt8m` | View Employee's Self Rating (`Activity_11j692f`) | Feedback / / Respond ? (`Gateway_0krqumi`) | — |
| `Flow_088ve74` | Feedback / / Respond ? (`Gateway_0krqumi`) | Comment on each Employee's Self Rating KRA or KPI (`Activity_1cki94k`) | Yes |
| `Flow_1nx5e3a` | Feedback / / Respond ? (`Gateway_0krqumi`) | (không có nhãn) (`Gateway_1s5hl5u`) | No (Manager Satisfied) |
| `Flow_1oqu1i0` | Comment on each Employee's Self Rating KRA or KPI (`Activity_1cki94k`) | Notify / to Employee (`Activity_1ddd548`) | — |
| `Flow_1xlhikd` | Feedback / / Respond ? (`Gateway_04zimsb`) | (không có nhãn) (`Gateway_1s5hl5u`) | No (Employee Satisfied) |
| `Flow_1qz07jb` | (không có nhãn) (`Gateway_1s5hl5u`) | Rate Employee Goal (`Activity_16p384u`) | — |
| `Flow_16t9sgp` | Notify / to Manager (`Activity_1o42ms8`) | [Self Rating] / Merge to start the feedback process again (`Gateway_0c6iud2`) | [LOOP BACK] / Feedback and respond between Manager and Employee until both parties are satisfied |
| `Flow_0n6cb0g` | Notify / to Manager (`Activity_1rtms55`) | [Self Rating] / Merge to start the feedback process again (`Gateway_0c6iud2`) | — |
| `Flow_0r2vn54` | Notify / to Employee (`Activity_1ddd548`) | Review Manager's Feedback/ Respond (`Activity_17dnswf`) | — |
| `Flow_1fccxj4` | Notify Employee (`Activity_0s4afhd`) | Select Current Appraisal Cycle (`Activity_02vft5k`) | — |
| `Flow_0cp2w0p` | Select Current Appraisal Cycle (`Activity_02vft5k`) | View Assigned Goal (`Activity_08ley76`) | — |
| `Flow_0op5xp2` | View Assigned Goal (`Activity_08ley76`) | View Rubric for each KPI (`Activity_022rxwr`) | — |
| `Flow_09l9za8` | View Rubric for each KPI (`Activity_022rxwr`) | Submit Goal (`Activity_1gqvi4y`) | — |
| `Flow_1lgxxof` | Submit Goal (`Activity_1gqvi4y`) | Conduct / Self-rating (`Activity_1ph24ox`) | — |
| `Flow_0mmybzb` | Conduct / Self-rating (`Activity_1ph24ox`) | Submit / Self-Rating (`Activity_1uie3ec`) | — |
| `Flow_1i2tab4` | Submit / Self-Rating (`Activity_1uie3ec`) | Notify / to Manager (`Activity_1rtms55`) | — |
| `Flow_0f9ynxj` | Review Manager's Feedback/ Respond (`Activity_17dnswf`) | Feedback / / Respond ? (`Gateway_04zimsb`) | — |
| `Flow_0k4kkf2` | Feedback / / Respond ? (`Gateway_04zimsb`) | Respond Manager's Feedback (`Activity_1i3marn`) | Yes |
| `Flow_194brbb` | Respond Manager's Feedback (`Activity_1i3marn`) | Notify / to Manager (`Activity_1o42ms8`) | — |
| `Flow_0yn7evj` | Rate Employee Goal (`Activity_16p384u`) | Submit Manager Rating (`Activity_0ygdxgj`) | — |
| `Flow_0a331cw` | Submit Manager Rating (`Activity_0ygdxgj`) | Notify / to Employee (`Activity_1arvgb4`) | — |
| `Flow_0iw8mg2` | Notify / to Employee (`Activity_1arvgb4`) | [Individual Rating] / Merge to start the / feedback process again (`Gateway_0prtaec`) | — |
| `Flow_0vnzzcj` | [Individual Rating] / Merge to start the / feedback process again (`Gateway_0prtaec`) | View Manager Rating (`Activity_0o834q6`) | — |
| `Flow_12iww28` | View Manager Rating (`Activity_0o834q6`) | Respond / Feedback ? (`Gateway_1fg1yqp`) | — |
| `Flow_0algawq` | Respond / Feedback ? (`Gateway_1fg1yqp`) | Comment on each Manager's Rating KRA or KPI (`Activity_19hm5an`) | Yes |
| `Flow_0yjmbfd` | Respond / Feedback ? (`Gateway_1fg1yqp`) | (không có nhãn) (`Gateway_1adm9if`) | No (Employee Satisfied) |
| `Flow_0izljzb` | Feedback / / Respond ? (`Gateway_1v42x5g`) | (không có nhãn) (`Gateway_1adm9if`) | No (Manager Satisified) |
| `Flow_1rzo029` | (không có nhãn) (`Gateway_1adm9if`) | Conduct / Self-rating (`Activity_1jwk2on`) | — |
| `Flow_01n98vz` | Conduct / Self-rating (`Activity_1jwk2on`) | Submit / Self-Rating (`Activity_03j1p16`) | — |
| `Flow_1yjpsci` | Submit / Self-Rating (`Activity_03j1p16`) | Notify to Manager (`Activity_0lszlxa`) | — |
| `Flow_00v0qji` | Notify to Manager (`Activity_0lszlxa`) | View Employee's Self Rating (`Activity_17fp1mz`) | — |
| `Flow_1semcpc` | View Employee's Self Rating (`Activity_17fp1mz`) | Feedback ? (`Gateway_0dwkatr`) | — |
| `Flow_1ydr7mx` | Feedback ? (`Gateway_0dwkatr`) | Provide feedback on Employee's Self Rating (`Activity_0kcts77`) | Yes |
| `Flow_0x5h1o6` | Feedback ? (`Gateway_0dwkatr`) | (không có nhãn) (`Gateway_0ucdgtr`) | No |
| `Flow_1273rc9` | Provide feedback on Employee's Self Rating (`Activity_0kcts77`) | (không có nhãn) (`Gateway_0ucdgtr`) | — |
| `Flow_1qzlxn9` | (không có nhãn) (`Gateway_0ucdgtr`) | Rate Employee Goal (`Activity_0z3r871`) | — |
| `Flow_0h5su40` | Notify / to Employee (`Activity_1sgv8ot`) | [Individual Rating] / Merge to start the / feedback process again (`Gateway_0prtaec`) | [LOOP BACK] / Feedback and respond between Manager and Employee until both parties are satisfied |
| `Flow_0chba9v` | Notify Respond to Manager (`Activity_0zactp8`) | Review Employee's Feedback/ Respond (`Activity_11ejbvg`) | — |
| `Flow_08waxvp` | Review Employee's Feedback/ Respond (`Activity_11ejbvg`) | Feedback / / Respond ? (`Gateway_1v42x5g`) | — |
| `Flow_1wunu9w` | Feedback / / Respond ? (`Gateway_1v42x5g`) | Respond Employee's Feedback (`Activity_0sk989p`) | Yes |
| `Flow_1r2bjut` | Respond Employee's Feedback (`Activity_0sk989p`) | Notify / to Employee (`Activity_1sgv8ot`) | — |
| `Flow_1rx9uot` | Comment on each Manager's Rating KRA or KPI (`Activity_19hm5an`) | Notify Respond to Manager (`Activity_0zactp8`) | — |
| `Flow_0wmcfsy` | Send for Approval (`Activity_12z6lsy`) | Corp HR approve change request ? (`Gateway_0taoydb`) | — |
| `Flow_0ipbkt8` | Corp HR approve change request ? (`Gateway_0taoydb`) | Reject Change Request (`Activity_0lbbssq`) | — |
| `Flow_0oxgi1a` | Corp HR approve change request ? (`Gateway_0taoydb`) | Approve Change Request (`Activity_0o42453`) | — |
| `Flow_0i01pim` | Reject Change Request (`Activity_0lbbssq`) | Merge to review the Role Based template library again / (rejected template included) (`Gateway_1hvw1m1`) | — |
| `Flow_1qxekzn` | Merge to review the Role Based template library again / (rejected template included) (`Gateway_1hvw1m1`) | View Published Designation Based Template Library (`Activity_0pwn5b8`) | — |
| `Flow_1o8pswt` | View Published Designation Based Template Library (`Activity_0pwn5b8`) | Local Configuration required ? / OR changes required upon rejection ? (`Gateway_03zwpjs`) | — |
| `Flow_01i7vsx` | Local Configuration required ? / OR changes required upon rejection ? (`Gateway_03zwpjs`) | Configure Template Library or its Rubric (`Activity_1cnlevt`) | Yes |
| `Flow_0tilciq` | Local Configuration required ? / OR changes required upon rejection ? (`Gateway_03zwpjs`) | (không có nhãn) (`Gateway_145c4si`) | No |
| `Flow_1fwgs6z` | Configure Template Library or its Rubric (`Activity_1cnlevt`) | Send for Approval (`Activity_12z6lsy`) | — |
| `Flow_14297sa` | Approve Change Request (`Activity_0o42453`) | (không có nhãn) (`Gateway_145c4si`) | — |
| `Flow_1ygbou9` | (không có nhãn) (`Gateway_145c4si`) | Apply Template Library to Employee (`Activity_0kqtll8`) | — |
| `Flow_1kmalk4` | Apply Template Library to Employee (`Activity_0kqtll8`) | Automatically Assign Goal (`Activity_1pw9aqx`) | — |
| `Flow_01cz9kx` | Automatically Assign Goal (`Activity_1pw9aqx`) | Check Assigned Goal (`Gateway_1w2g6kz`) | — |
| `Flow_1esu5hn` | (không có nhãn) (`Gateway_1pl3rx2`) | Notify Employee (`Activity_0s4afhd`) | — |
| `Flow_065kd6j` | Manually Re-Assign Goal (`Activity_12w0foa`) | (không có nhãn) (`Gateway_1pl3rx2`) | — |
| `Flow_1ga69e0` | Check Assigned Goal (`Gateway_1w2g6kz`) | (không có nhãn) (`Gateway_1pl3rx2`) | No Duplicate Template Assigned and all employee are assigned |
| `Flow_0hhven5` | Check Assigned Goal (`Gateway_1w2g6kz`) | Manually Re-Assign Goal (`Activity_12w0foa`) | Template Duplicated for Employee |
| `Flow_0qep84f` | Check Assigned Goal (`Gateway_1w2g6kz`) | Notify Corporate HR (`Activity_1h1vl8p`) | No Template assigned for any Employee |
| `Flow_0uvmu84` | Rate Employee Goal (`Activity_0z3r871`) | Rating Data ? (`Gateway_07t4291`) | — |
| `Flow_1jmc818` | Rating Data ? (`Gateway_07t4291`) | Input Achievement (`Activity_098w8bk`) | Manual Input |
| `Flow_1eknwx8` | Input Achievement (`Activity_098w8bk`) | (không có nhãn) (`Gateway_1yo2ofi`) | — |
| `Flow_1xm256t` | Rating Data ? (`Gateway_07t4291`) | (không có nhãn) (`Gateway_1yo2ofi`) | Automation Input |
| `Flow_1oyvjjq` | (không có nhãn) (`Gateway_1yo2ofi`) | Rate score based on associated Rubric (`Activity_1egz21e`) | — |
| `Flow_0j5hs3v` | Rate score based on associated Rubric (`Activity_1egz21e`) | Submit Manager Rating (`Activity_0nibfz6`) | — |
| `Flow_0be4j7z` | Submit Manager Rating (`Activity_0nibfz6`) | Calculate Score pre Normalization (`Activity_1eai38x`) | — |
| `Flow_00gi4i4` | Calculate Score pre Normalization (`Activity_1eai38x`) | Notify Corp HR to start Normalization (`Activity_1bi5h1k`) | — |
| `Flow_15gv9pi` | Notify Corp HR to start Normalization (`Activity_1bi5h1k`) | Review Rating Score Pre Normalization (`Activity_0rq72q6`) | — |
| `Flow_0hif0ak` | Review Rating Score Pre Normalization (`Activity_0rq72q6`) | Merge to Normalize again (`Gateway_04u7w77`) | — |
| `Flow_03ivp0j` | Merge to Normalize again (`Gateway_04u7w77`) | Normalize Rating Score Option (`Gateway_0a55y07`) | — |
| `Flow_0azaofr` | Normalize Rating Score Option (`Gateway_0a55y07`) | Scale Up Rating Score (`Activity_0t9khwd`) | — |
| `Flow_008o5qi` | Normalize Rating Score Option (`Gateway_0a55y07`) | Scale Down Rating Score (`Activity_12c5mcr`) | — |
| `Flow_0ifype9` | Scale Up Rating Score (`Activity_0t9khwd`) | (không có nhãn) (`Gateway_0rlzxfl`) | — |
| `Flow_1vhmbbs` | Scale Down Rating Score (`Activity_12c5mcr`) | (không có nhãn) (`Gateway_0rlzxfl`) | — |
| `Flow_00th0b2` | (không có nhãn) (`Gateway_0rlzxfl`) | Re-Calculate Rating Score (`Activity_07nnoe1`) | — |
| `Flow_002df4l` | Re-Calculate Rating Score (`Activity_07nnoe1`) | Review / Re-Calculated Rating Score (`Activity_03djxoo`) | — |
| `Flow_09wjvov` | Review / Re-Calculated Rating Score (`Activity_03djxoo`) | Satisfied ? (`Gateway_1crydfc`) | — |
| `Flow_0j5zasw` | Satisfied ? (`Gateway_1crydfc`) | Merge to Normalize again (`Gateway_04u7w77`) | [LOOP BACK] / Corporate HR can keep repeating the normalization task until they are satisfied |
| `Flow_0s11zin` | Satisfied ? (`Gateway_1crydfc`) | Publish Final Rating Score & Feedback for Employee (`Activity_11mn5uh`) | — |
| `Flow_18mjkcg` | Publish Final Rating Score & Feedback for Employee (`Activity_11mn5uh`) | View Final Rating Score & Feedback on Individual Rating (`Activity_10drbxx`) | — |
| `Flow_1fwmunq` | View Final Rating Score & Feedback on Individual Rating (`Activity_10drbxx`) | END (`Event_0yoqgni`) | — |

## 6. Data store và data input association

| Data store | Nhãn | Task đọc | Association |
|---|---|---|---|
| `DataStoreReference_13j2lup` | Extract / Default Global Rubric Data | View Default Global Rubric (`Activity_0yliwah`) | `DataInputAssociation_0ckjai0` |
| `DataStoreReference_1s4t7ot` | Extract KRA - KPI where: / STATUS = Active | Create / Designation Based / Template Library (`Activity_0bnucj2`) | `DataInputAssociation_121yupw` |

## 7. Toàn bộ annotation (16)

| ID | Nội dung | Node được chú thích |
|---|---|---|
| `TextAnnotation_1m9h4dh` | Service / / Automation Task | Automatically Assign Goal (`Activity_1pw9aqx`) |
| `TextAnnotation_0g9m70c` | Service / / Automation Task | Notify Employee (`Activity_0s4afhd`) |
| `TextAnnotation_1wnlcny` | Mid-Year Review | Rate Employee Goal (`Activity_16p384u`) |
| `TextAnnotation_05050hs` | Year-End Review | Rate Employee Goal (`Activity_0z3r871`) |
| `TextAnnotation_0qnfxx3` | Mid-Year Review | Conduct / Self-rating (`Activity_1ph24ox`) |
| `TextAnnotation_1kh0q2j` | Year-End Review | Conduct / Self-rating (`Activity_1jwk2on`) |
| `TextAnnotation_0tbtel6` | Service / / Automation Task | Notify Corporate HR (`Activity_1h1vl8p`) |
| `TextAnnotation_1dh0fsg` | Service / / Automation Task | Notify / to Manager (`Activity_1rtms55`) |
| `TextAnnotation_12ntxyc` | Service / / Automation Task | Notify / to Employee (`Activity_1ddd548`) |
| `TextAnnotation_00gs7sk` | Service / / Automation Task | Notify / to Employee (`Activity_1arvgb4`) |
| `TextAnnotation_133zh9d` | Service / / Automation Task | Notify Respond to Manager (`Activity_0zactp8`) |
| `TextAnnotation_0dp0u8m` | Service / / Automation Task | Notify / to Employee (`Activity_1sgv8ot`) |
| `TextAnnotation_0yxcjsk` | Service / / Automation Task | Notify to Manager (`Activity_0lszlxa`) |
| `TextAnnotation_1xql7n8` | Service / / Automation Task | Calculate Score pre Normalization (`Activity_1eai38x`) |
| `TextAnnotation_1gpugmt` | Service / / Automation Task | Notify Corp HR to start Normalization (`Activity_1bi5h1k`) |
| `TextAnnotation_01offhh` | Service / / Automation Task | Re-Calculate Rating Score (`Activity_07nnoe1`) |

## 8. Điểm đầu và cuối

- START: `Event_1ooxcox`, lane Corporate HR, đi đến `Gateway_0rhpfn7` để bắt đầu hoặc tiếp tục tạo master data.
- END: `Event_0yoqgni`, lane Employee, sau task xem final rating và feedback.
- Cả hai là event thường, không có timer/message/error event definition.

## 9. Phạm vi sử dụng phụ lục

Dùng ID để tìm trong công cụ BPMN hoặc XML, kiểm tra một yêu cầu đã có nguồn hay là phần bổ sung. Phụ lục giữ nguyên đường đi, kể cả các điểm thiếu điều kiện và đường vòng cần chốt trong tài liệu 13. Không chỉnh sửa file BPMN nguồn trong lần phân tích này.
