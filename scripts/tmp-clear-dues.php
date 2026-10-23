<?php
$pdo = new PDO('mysql:host=127.0.0.1;port=3307;dbname=projectdb_local;charset=utf8mb4', 'root', '');
$pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
$pdo->exec('TRUNCATE TABLE cm_membership_payments');
$pdo->exec('TRUNCATE TABLE cm_membership_fees');
$pdo->exec(
    'UPDATE cm_persons SET has_previous_dues = 0, previous_dues_amount = NULL,
     previous_dues_notes = NULL, previous_dues_through_year = NULL WHERE deleted_at IS NULL'
);
$pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
$c = $pdo->query('SELECT COUNT(*) c FROM cm_membership_fees')->fetch();
echo 'cleared. fee_rows=' . $c['c'] . PHP_EOL;
