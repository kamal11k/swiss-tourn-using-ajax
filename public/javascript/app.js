

$(function(){
    var $createTour = $('.createTour');
    var $btn_addPlayer = $('.btn_addPlayer');
    var $btn_addExPlayer = $('.btn_addExPlayer');
    var $btn_start = $('.btn_start');
    var $round = $('.round');
    var $round_modal = $('#round_modal');

    $createTour.on('click',function(event){
        var name = $('.input_tour').val()
        var data = {
                t_name: name
            }
        $.ajax({
            method: 'POST',
            url: '/createTournament',
            data : data,
            success:function(data){
                var html =
                        "<tr><th><a class='tour' href='/individualTournament/"+data.insertId+"'>\
                        "+name+"</a></td><td>Not Started</td><td>Not declared</td></tr>"
                $('tbody').append(html)
            }
        })
    })

    function existingPlayers(Players){
        //console.log(Players)
        $('.selectpicker').html('')
        Players.forEach(function(player){
            $('.selectpicker').append("<option>"+player.name+"</option>")
        })
    }

    function playerStanding(){
        $.ajax({
            url: '/showStanding',
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
        var data = {
            p_name :name
        }
        $.ajax({
            method: 'POST',
            url: '/addnewPlayer',
            data : data,
            success:function(data){
                $('.Players').append("<li>"+name+"</li>");
                existingPlayers(data.data);
                playerStanding();
            }
        })
    })

    $btn_addExPlayer.on('click',function(){
        var name = $('#tick1').val();
        var data = {
            p_name :name
        }
        $.ajax({
            method: 'POST',
            url: '/addExistingPlayer',
            data : data,
            success:function(data){
                $('.Players').append("<li>"+name+"</li>");
                existingPlayers(data.data);
                playerStanding();
            }
        })
    })

    $btn_start.on('click',function(event){
        $.ajax({
            method:'GET',
            url: '/Start',
            success: function(data){
                if(!data.msg){
                    $round.empty();
                    for(var i=1;i<=Math.log2(data.count);i++){
                        var row = `
                            <tr>
                                <th>`+i+`</th>
                                <td>Not Started</td>
                                <td><button type="button" class="btn btn-primary" data-toggle="modal"
                                                    data-target="#round_modal">Execute</button></td>
                                <td>Not Declared</td>
                            </tr>`
                        $round.append(row)
                    }
                }
                else {
                    alert(data.msg)
                }
            }
        })
    })

    $round_modal.on('show.bs.modal',function(event){
        event.stopPropagation();
        $.ajax({
            method: 'GET',
            url: '/getFixture',
            success: function(data){
                $('#mt_body').empty();
                data.forEach(function(pair){
                    var player1 = pair[0].Name;
                    var player2 = pair[1].Name;
                    var row = `
                            <tr>
                            <td>`+player1+`</td>
                            <td>`+player2+`</td>
                            <td>
                                <select>
                                  <option>`+player1+`</option>
                                  <option>`+player2+`</option>
                              </select>
                            </td></tr>
                    `
                    $('#mt_body').append(row);
                    console.log(row, 'row')
                })
            }
        })
    })



})
