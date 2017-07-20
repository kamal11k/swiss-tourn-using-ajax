
$(function(){
    var $createTour = $('.createTour');
    var $btn_addPlayer = $('.btn_addPlayer');
    var $btn_addExPlayer = $('.btn_addExPlayer');
    var $btn_start = $('.btn_start');
    var $round = $('.round');
    var $round_modal = $('#round_modal');
    var $btn_report = $('.btn_report');
    var $singleRound_modal = $('#singleRound_modal');

    function start(){
        var t_id = $('.hidden_id').val();
        $.ajax({
            method:'GET',
            url: '/Start/'+t_id,
            success: function(data){
                if(!data.msg){
                    var roundsToBePlayed = Math.log2(data.count);
                    var roundsPlayed = data.max_round.max_round;
                    $round.empty();
                    for(var i=1;i<=roundsToBePlayed;i++){
                        var row = `
                            <tr>
                                <th class="round_no">`+i+`</th>
                                <td id=`+t_id+`status`+i+`>`+data.status[i-1]+`</td>
                                <td><button type="button" class="btn btn-warning l_btn" data-id1=`+i+`
                                data-toggle="modal" data-target="#round_modal">Execute</button></td>
                                <td><button type="button" class="btn btn-primary" data-id2=`+i+`
                                data-toggle="modal" data-target="#singleRound_modal">Result</button></td>
                            </tr>`
                        $round.append(row)
                    }
                    $('[data-id1='+roundsPlayed+']').attr('disabled', true);
                    var next = roundsPlayed+1;
                    $('[data-id2='+next+']').attr('disabled', true);
                    for(var i=roundsPlayed-1;i>=1;i--){
                        $('[data-id1='+i+']').attr('disabled', true);
                    }
                    for(var i=roundsPlayed+2;i<=roundsToBePlayed;i++){
                        $('[data-id1='+i+']').attr('disabled', true);
                        $('[data-id2='+i+']').attr('disabled', true);
                    }
                    if(roundsPlayed>0){
                        $('.btn_start').text("Continue Game");
                    }
                    if(roundsPlayed==roundsToBePlayed){
                        $('.round_table').show();
                        $('.winCup').show();
                        var winner = $('.standing').children("tr:first").children("th:first")[0].innerHTML
                        $('.btn_start').text("WINNER");
                        $('.winner_declare').html(winner).show();
                        $('.btn_start').attr('disabled' , true);
                    }
                }
            }
        })

    }
    start();

    function checkExistings(){
        if($('#tick1')[0].childElementCount==0){
            $('.btn_addExPlayer').attr("disabled",true)
        }
    }
    checkExistings();


    function existingPlayers(Players){
        //console.log(Players)
        $('.selectpicker').html('')
        Players.forEach(function(player){
            $('.selectpicker').append("<option>"+player.name+"</option>")
        })
    }

    function setWinner(t_id,winner){
        var data = {
                t_id:t_id,
                winner:winner
            }
        $.ajax({
            method: 'POST',
            data:data,
            url: '/setWinner',
            success: function(data){

            }
        })
    }

    function disableButtons(t_id,count,max_round){
        if(Math.log2(count)==max_round){
            $('[data-id1='+max_round+']').attr('disabled', true);
            $('[data-id2='+max_round+']').attr('disabled', false);
            var winner = $('.standing').children("tr:first").children("th:first")[0].innerHTML
            $('.btn_start').html("Winner")
            $('.winCup').show();
            $('.winner_declare').html(winner).show();
            setWinner(t_id,winner);
        }
        else{
            $('[data-id1='+max_round+']').attr('disabled', true);
            $('[data-id2='+max_round+']').attr('disabled', false);
            var next = max_round+1;
            $('[data-id1='+next+']').attr('disabled', false);
        }
    }

    function playerStanding(){
        var t_id = $('.hidden_id').val();
        $.ajax({
            url: '/showStanding/'+t_id,
            success: function(standing){
                $('.standing').empty();
                standing.forEach(function(st){
                    var row = `<tr><th>`+st.Name+`</th><td>`+st.Matches+`</td>
                    <td>`+st.Wins+`</td><td>`+st.Losses+`</td><td>`;

                    $('.standing').append(row);
                })
            }
        })
    }

    $btn_addPlayer.on('click',function(){
        var name = $('.inputPname').val();
        var t_id = $('.hidden_id').val();
        if(name=='')
            alert('Name required')
        else{
            var data = {
            p_name :name,
            t_id: t_id
            }
            $.ajax({
                method: 'POST',
                url: '/addnewPlayer',
                data : data,
                success:function(data){
                    $('.inputPname').val('');
                    if(data.msg){
                        alert("Can't add Player")
                    }
                    else {
                        $(".round_table").css("display", "none");
                        $('.btn_start').attr('disabled',false);
                        $('.Players').append("<li>"+name+"</li>");
                        console.log(data);
                        existingPlayers(data.data);
                        playerStanding();
                    }
                }
            })
        }
    })

    $btn_addExPlayer.on('click',function(){
        var name = $('#tick1').val();
        var t_id = $('.hidden_id').val();
        var data = {
            p_name :name,
            t_id: t_id
        }
        $.ajax({
            method: 'POST',
            url: '/addExistingPlayer',
            data : data,
            success:function(data){
                if(data.msg){
                    alert("Can't add player")
                }
                else {
                    $(".round_table").css("display", "none");
                    $('.btn_start').attr('disabled',false);
                    $('.Players').append("<li>"+name+"</li>");
                    console.log(data,'llll');
                    existingPlayers(data.data);
                    playerStanding();
                    checkExistings();
                }
            }
        })
    })

    $btn_start.on('click',function(event){
        var t_id = $('.hidden_id').val();
        $.ajax({
            method: 'GET',
            url: '/canStartMatch/'+t_id,
            success: function(data){
                if(data.msg){
                    alert(data.msg)
                }
                else{
                    start();
                    $('.btn_start').attr('disabled',true);
                    $('.round_table').show();
                }
            }

        })
    })

    $round_modal.on('show.bs.modal',function(event){
        var target = event.relatedTarget;
        var round = $(target).attr('data-id1');
        var t_id = $('.hidden_id').val();
        event.stopPropagation();
        //console.log(round);
        $.ajax({
            method: 'GET',
            url: '/getFixture/'+round+'.'+t_id,
            success: function(data){
                var pairs = data.pairs;
                $('#mt_body').empty();
                data.pairs.forEach(function(pair){
                    var player1 = pair[0].Name;
                    var p1_id  = pair[0].id;
                    var player2 = pair[1].Name;
                    var p2_id = pair[1].id;
                    var row = `
                            <tr>
                                <td>`+player1+`</td>
                                <td>`+player2+`</td>
                                <td>
                                    <select class="winners">
                                      <option value=`+p1_id+`/`+p2_id+`/`+round+`>`+player1+`</option>
                                      <option value=`+p2_id+`/`+p1_id+`/`+round+`>`+player2+`</option>
                                    </select>
                                </td>
                            </tr>
                    `
                    $('#mt_body').append(row);
                })
            }
        })
    })

    $btn_report.on('click',function(){
        var opponents=[];
        $('select.winners').each(function(){
            opponents.push($(this).val());
        })

        var roundDetails = [];
        opponents.forEach(function(info){
            roundDetails.push({
                round: info.split('/')[2],
                winner_id:info.split('/')[0],
                loser_id:info.split('/')[1]
            })
        })
        var t_id = $('.hidden_id').val();
        var data = {roundDetails:roundDetails,t_id:t_id}
        $.ajax({
            method: 'POST',
            data: data,
            url: '/reportMatch',
            success: function(data){
                playerStanding();
                var status = `<h2>`+data.status+`</h2>`
                $('.tour_status').html(status);
                $('#'+t_id+'status'+data.round).html('Completed');
                //$('#'+data.t_id+'winner'+data.round).html(data.winner);
                $.ajax({
                    method:'GET',
                    url:'/infoForDisable/'+t_id,
                    success: function(data){
                        disableButtons(t_id,data.count,data.max_round.max_round);
                    }
                })
            }
        })
    })

    $singleRound_modal.on('show.bs.modal',function(event){
        var target = event.relatedTarget;
        var round = $(target).attr('data-id2');
        var t_id = $('.hidden_id').val();
        event.stopPropagation();
        $.ajax({
            method: 'GET',
            url: '/getRoundResult/'+round+'.'+t_id,
            success: function(data){
                $('#mt_body2').empty();
                data.data.forEach(function(match){
                    var row = `
                            <tr>
                                <td>`+match.player1_name+`</td>
                                <td>`+match.player2_name+`</td>
                                <td>`+match.winner_name+`</td>
                            </tr>
                    `
                    $('#mt_body2').append(row);
                })

            }
        })
    })

    // $('.logout').on('click',function(){
    //     $.ajax({
    //         method:'GET',
    //         url:'/logout',
    //         success: function(data){
    //             alert("he he");
    //         }
    //     })
    // })



})
