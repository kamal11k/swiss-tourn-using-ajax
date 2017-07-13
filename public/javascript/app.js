

$(function(){
    var $createTour = $('.createTour')
    var $btn_addPlayer = $('.btn_addPlayer')
    var $btn_addExPlayer = $('.btn_addExPlayer')

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
        console.log(Players)
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
        // tour_name = $('.tour_name').val();
        // tour_status = $('.tour_status').val();
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



})
